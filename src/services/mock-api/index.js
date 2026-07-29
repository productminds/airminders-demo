import { createRng, hashString } from "./random"
import { simulateLatency } from "./latency"
import { getForcedScenario, getPinnedSeed } from "./scenarios"
import { generateFlightOffers } from "./generateFlightOffers"
import { MockApiError } from "./errors"
import { validatePassenger } from "../../lib/validators"

export { AIRPORTS } from "./data/airports"

/**
 * @param {string} seedKey
 * @returns {() => number}
 */
function rngFor(seedKey) {
  const pinnedSeed = getPinnedSeed()
  return createRng(pinnedSeed ?? hashString(seedKey))
}

/**
 * RF-01/03/13: search flights with artificial latency and seeded,
 * reproducible pseudo-random results.
 * @param {import("../../types/domain").SearchCriteria} criteria
 * @returns {Promise<import("../../types/domain").SearchResults>}
 */
export async function searchFlights(criteria) {
  const scenario = getForcedScenario()
  const rng = rngFor(criteria.searchId)
  await simulateLatency(rng)

  if (scenario === "timeout") {
    throw new MockApiError("A busca demorou demais para responder.", "timeout")
  }

  // RF-12: search must be able to return zero results (forced failure scenario)
  if (scenario === "empty") {
    return {
      searchId: criteria.searchId,
      outboundOffers: [],
      inboundOffers: criteria.tripType === "round_trip" ? [] : undefined,
    }
  }

  const outboundOffers = generateFlightOffers(
    {
      originIata: criteria.originIata,
      destinationIata: criteria.destinationIata,
      date: criteria.departureDate,
      cabinClass: criteria.cabinClass,
    },
    rng
  )

  const inboundOffers =
    criteria.tripType === "round_trip"
      ? generateFlightOffers(
          {
            originIata: criteria.destinationIata,
            destinationIata: criteria.originIata,
            date: criteria.returnDate,
            cabinClass: criteria.cabinClass,
          },
          rng
        )
      : undefined

  return { searchId: criteria.searchId, outboundOffers, inboundOffers }
}

/**
 * RF-07/RF-12: server-side style re-validation of passenger data. Client
 * forms already block obviously-missing fields; this simulates a backend
 * document-validation step that can also be forced to fail on demand.
 * @param {Object} params
 * @param {string} params.bookingId
 * @param {import("../../types/domain").Passenger[]} params.passengers
 * @returns {Promise<{ bookingId: string, passengers: import("../../types/domain").Passenger[] }>}
 */
export async function submitPassengers({ bookingId, passengers }) {
  const scenario = getForcedScenario()
  const rng = rngFor(bookingId)
  await simulateLatency(rng)

  const fieldErrors = passengers.flatMap((passenger) =>
    validatePassenger(passenger).map((error) => ({
      passengerId: passenger.passengerId,
      ...error,
    }))
  )

  if (scenario === "validationFail" && fieldErrors.length === 0) {
    fieldErrors.push({
      passengerId: passengers[0].passengerId,
      fieldName: "documentNumber",
      errorType: "invalid_format",
    })
  }

  if (fieldErrors.length > 0) {
    const error = new MockApiError(
      "Falha na validação dos dados do passageiro.",
      "validation_failed"
    )
    error.fieldErrors = fieldErrors
    throw error
  }

  return { bookingId, passengers }
}

/**
 * RF-09/10/11/12, RS-02: mocked payment authorization. Never receives or
 * persists real card data — only the mocked shape defined in PaymentDetails.
 * specs.md §4.2: order_id is minted client-side at the moment of purchase
 * confirmation (i.e. once this call resolves successfully), not here —
 * this only issues the PNR, which is genuinely a backend concern.
 * @param {Object} params
 * @param {string} params.bookingId
 * @param {import("../../types/domain").PaymentDetails} params.payment
 * @returns {Promise<{ bookingId: string, pnr: string, status: "confirmed" }>}
 */
export async function submitPayment({ bookingId, payment }) {
  const scenario = getForcedScenario()
  const rng = rngFor(bookingId + payment.method)
  await simulateLatency(rng)

  if (scenario === "paymentDeclined") {
    throw new MockApiError("Pagamento recusado.", "payment_declined")
  }

  const pnr = Array.from(
    { length: 6 },
    () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(rng() * 32)]
  ).join("")

  return { bookingId, pnr, status: "confirmed" }
}
