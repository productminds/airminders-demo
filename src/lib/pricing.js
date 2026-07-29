const TAX_RATE = 0.2

/**
 * @param {import("../types/domain").FlightOffer[]} offers
 * @param {string} flightNumber
 * @returns {import("../types/domain").FlightOffer | undefined}
 */
export function findOffer(offers, flightNumber) {
  return offers?.find((offer) => offer.flightNumber === flightNumber)
}

/**
 * @param {import("../types/domain").FlightOffer} offer
 * @param {string} fareFamilyId
 * @returns {import("../types/domain").FareFamily | undefined}
 */
export function findFareFamily(offer, fareFamilyId) {
  return offer?.fareFamilies.find((fareFamily) => fareFamily.id === fareFamilyId)
}

/**
 * RF-08: composes the price breakdown shown on the review screen from the
 * offers already fetched and the fares the user selected — no mock-api
 * round trip needed for this step.
 * @param {Object} params
 * @param {import("../types/domain").SearchResults} params.results
 * @param {import("../types/domain").SelectedTrip} params.selectedTrip
 * @param {number} params.passengerCount
 * @returns {import("../types/domain").PriceBreakdown}
 */
export function computePriceBreakdown({ results, selectedTrip, passengerCount }) {
  const outboundOffer = findOffer(
    results.outboundOffers,
    selectedTrip.outboundFlightNumber
  )
  const outboundFare = findFareFamily(outboundOffer, selectedTrip.outboundFareFamilyId)

  const inboundOffer = selectedTrip.inboundFlightNumber
    ? findOffer(results.inboundOffers, selectedTrip.inboundFlightNumber)
    : undefined
  const inboundFare = findFareFamily(inboundOffer, selectedTrip.inboundFareFamilyId)

  const perPassengerFare = (outboundFare?.price ?? 0) + (inboundFare?.price ?? 0)
  const fareTotal = perPassengerFare * passengerCount
  const taxesTotal = Math.round(fareTotal * TAX_RATE)

  return {
    fareTotal,
    taxesTotal,
    grandTotal: fareTotal + taxesTotal,
    currency: "BRL",
  }
}
