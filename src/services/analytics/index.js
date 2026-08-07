import * as amplitude from "@amplitude/analytics-browser"
import { sessionReplayPlugin } from "@amplitude/plugin-session-replay-browser"
import { ampli, ApiKey, DefaultConfiguration } from "../../ampli"
import { findAirport } from "../mock-api/data/airports"
import { findFareFamily, findOffer } from "../../lib/pricing"
import packageJson from "../../../package.json"

/**
 * Analytics facade (docs/AMPLI-CLI.md §3): the only module allowed to
 * import src/ampli. Callers pass camelCase domain data; the snake_case
 * event-property convention and all tracking-plan vocabulary mappings
 * stay contained here.
 */

const CURRENCY = "BRL"

// Tracking plan enum is light/plus/top; the app's fare families are
// basica/essencial/flex (services/mock-api/data/fareFamilies.js). Mapped
// here so neither vocabulary leaks into the other layer.
const FARE_FAMILY_BY_ID = {
  basica: "light",
  essencial: "plus",
  flex: "top",
}

const FIELD_NAME_BY_FORM_FIELD = {
  firstName: "first_name",
  lastName: "last_name",
  birthDate: "birth_date",
  documentNumber: "document_number",
  email: "email",
  phone: "phone",
}

const SORT_TYPE_BY_SORT = {
  price: "price_asc",
  duration: "duration_asc",
}

// Mock-api error vocabulary → tracking plan failure_reason enum.
const FAILURE_REASON_BY_ERROR = {
  payment_declined: "card_declined",
  timeout: "gateway_timeout",
}

// Journey timing is a purely analytical concern, so it lives here instead
// of in app state: feeds the optional time_to_* properties.
let searchSubmittedAt = null
let selectionStartedAt = null
let passengerStartedAt = null

function secondsSince(timestamp) {
  return timestamp ? Math.round((Date.now() - timestamp) / 1000) : undefined
}

function baseProperties() {
  return {
    app_version: packageJson.version,
    environment: import.meta.env.DEV ? "development" : "production",
    locale: navigator.language,
    platform: "web",
  }
}

const MS_PER_DAY = 86_400_000

function daysToDeparture(departureDate) {
  return Math.max(0, Math.round((Date.parse(departureDate) - Date.now()) / MS_PER_DAY))
}

function isDomestic(originIata, destinationIata) {
  return (
    findAirport(originIata)?.country === "Brasil" &&
    findAirport(destinationIata)?.country === "Brasil"
  )
}

/**
 * The passenger form collects a single free-form document number (RF-07),
 * so the plan's document_type enum is inferred from its shape.
 * @param {string} documentNumber
 * @returns {'cpf'|'passport'|'rg'}
 */
function documentTypeOf(documentNumber) {
  if (/[a-zA-Z]/.test(documentNumber)) return "passport"
  return documentNumber.replace(/\D/g, "").length === 11 ? "cpf" : "rg"
}

function lowestFarePrice(offer) {
  return Math.min(...offer.fareFamilies.map((fareFamily) => fareFamily.price))
}

/**
 * Initialize the Ampli SDK. Must be called once at application startup,
 * before anything renders or tracks — never from inside a component,
 * where it would re-run on every render.
 *
 * The Amplitude instance is built here (instead of ampli.load creating it)
 * because Session Replay is a plugin that must be added before init so it
 * captures from the very first event of the session.
 */
export function initAnalytics() {
  const instance = amplitude.createInstance()
  // sampleRate 1 records every session — demo setting; sample down in a
  // real production rollout. Inputs are masked by default (RS-01/RS-02).
  instance.add(sessionReplayPlugin({ sampleRate: 1 }))
  instance.init(ApiKey.goldemoamplicli, {
    ...DefaultConfiguration,
    // Sessions feed the replay list; the other autocapture events stay
    // off so the stream only carries events defined in the tracking plan.
    autocapture: {
      sessions: true,
      pageViews: false,
      formInteractions: false,
      fileDownloads: false,
      attribution: false,
      elementInteractions: false,
    },
  })
  ampli.load({ client: { instance } })
}

/**
 * Logo Clicked is not in the tracking plan yet, so it goes through the
 * wrapper's generic track(). Once the event is added to the plan and the
 * SDK re-pulled, replace this with the typed ampli method.
 * @param {Object} params
 * @param {string} [params.screenName] - screen where the logo was clicked
 */
export function trackLogoClicked({ screenName } = {}) {
  ampli.track({
    event_type: "Logo Clicked",
    event_properties: {
      ...baseProperties(),
      screen_name: screenName,
    },
  })
}

/**
 * @param {Object} params
 * @param {string} params.screenName
 * @param {string} [params.bookingStep]
 * @param {string} [params.referrerScreen]
 */
export function trackScreenViewed({ screenName, bookingStep, referrerScreen }) {
  ampli.screenViewed({
    ...baseProperties(),
    screen_name: screenName,
    booking_step: bookingStep,
    referrer_screen: referrerScreen,
  })
}

/**
 * @param {Object} params
 * @param {'home'|'results_edit'|'deeplink'} params.entryPoint
 */
export function trackFlightSearchStarted({ entryPoint }) {
  ampli.flightSearchStarted({
    ...baseProperties(),
    entry_point: entryPoint,
  })
}

/**
 * Intent event: fires on submit, before the mock-api responds.
 * @param {import("../../types/domain").SearchCriteria} criteria
 */
export function trackFlightSearchSubmitted(criteria) {
  searchSubmittedAt = Date.now()
  selectionStartedAt = null
  passengerStartedAt = null

  const isRoundTrip = criteria.tripType === "round_trip"
  ampli.flightSearchSubmitted({
    ...baseProperties(),
    search_id: criteria.searchId,
    trip_type: criteria.tripType,
    origin_iata: criteria.originIata,
    destination_iata: criteria.destinationIata,
    departure_date: criteria.departureDate,
    return_date: criteria.returnDate,
    cabin_class: criteria.cabinClass,
    days_to_departure: daysToDeparture(criteria.departureDate),
    is_domestic: isDomestic(criteria.originIata, criteria.destinationIata),
    trip_length_days:
      isRoundTrip && criteria.returnDate
        ? Math.round(
            (Date.parse(criteria.returnDate) - Date.parse(criteria.departureDate)) /
              MS_PER_DAY
          )
        : undefined,
    passenger_adult_count: criteria.passengerAdultCount,
    // RF-01: the search form only books adult passengers today
    passenger_child_count: 0,
    passenger_infant_count: 0,
  })
}

/**
 * Outcome event: fires only after the mock-api resolves.
 * @param {Object} params
 * @param {import("../../types/domain").SearchResults} params.results
 * @param {number} params.searchLatencyMs
 */
export function trackFlightSearchResultsViewed({ results, searchLatencyMs }) {
  selectionStartedAt = Date.now()

  const hasResults = results.outboundOffers.length > 0
  ampli.flightSearchResultsViewed({
    ...baseProperties(),
    search_id: results.searchId,
    result_count: results.outboundOffers.length + (results.inboundOffers?.length ?? 0),
    has_results: hasResults,
    lowest_price_amount: hasResults
      ? Math.min(...results.outboundOffers.map(lowestFarePrice))
      : undefined,
    search_latency_ms: searchLatencyMs,
    currency: CURRENCY,
  })
}

/**
 * @param {Object} params
 * @param {string} params.searchId
 * @param {'no_results'|'invalid_route'|'timeout'|'unexpected_error'} params.errorType
 * @param {string} [params.errorCode]
 */
export function trackFlightSearchFailed({ searchId, errorType, errorCode }) {
  ampli.flightSearchFailed({
    ...baseProperties(),
    search_id: searchId,
    error_type: errorType,
    error_code: errorCode,
  })
}

/**
 * @param {Object} params
 * @param {string} params.searchId
 * @param {'stops'|'departure_time'|'duration'|'airline'|'price'} params.filterType
 * @param {'price'|'duration'|'stops'} [params.sortBy] - present only for sort changes
 * @param {number} params.resultCountAfter
 */
export function trackFlightSearchFilterApplied({
  searchId,
  filterType,
  sortBy,
  resultCountAfter,
}) {
  ampli.flightSearchFilterApplied({
    ...baseProperties(),
    search_id: searchId,
    filter_type: filterType,
    sort_type: sortBy ? SORT_TYPE_BY_SORT[sortBy] : undefined,
    result_count_after: resultCountAfter,
  })
}

/**
 * @param {Object} params
 * @param {string} params.searchId
 * @param {'outbound'|'inbound'} params.legType
 * @param {import("../../types/domain").FlightOffer} params.offer
 * @param {import("../../types/domain").FareFamily} params.fare
 * @param {number} params.position - 1-based position in the visible result list
 */
export function trackFlightSelected({ searchId, legType, offer, fare, position }) {
  ampli.flightSelected({
    ...baseProperties(),
    search_id: searchId,
    leg_type: legType,
    flight_number: offer.flightNumber,
    carrier_code: offer.flightNumber.slice(0, 2),
    departure_hour: new Date(offer.departureTime).getHours(),
    duration_minutes: offer.durationMinutes,
    is_direct: offer.stops === 0,
    stops_count: offer.stops,
    price_amount: fare.price,
    result_position: position,
    currency: CURRENCY,
  })
}

/**
 * @param {Object} params
 * @param {string} params.searchId
 * @param {'outbound'|'inbound'} params.legType
 * @param {import("../../types/domain").FlightOffer} params.offer
 * @param {import("../../types/domain").FareFamily} params.fare
 */
export function trackFareSelected({ searchId, legType, offer, fare }) {
  ampli.fareSelected({
    ...baseProperties(),
    search_id: searchId,
    leg_type: legType,
    fare_family: FARE_FAMILY_BY_ID[fare.id],
    price_amount: fare.price,
    price_difference_from_lowest: fare.price - lowestFarePrice(offer),
    currency: CURRENCY,
  })
}

/**
 * @param {Object} params
 * @param {string} params.searchId
 * @param {import("../../types/domain").TripType} params.tripType
 * @param {number} params.totalAmount
 */
export function trackTripSelectionCompleted({ searchId, tripType, totalAmount }) {
  ampli.tripSelectionCompleted({
    ...baseProperties(),
    search_id: searchId,
    trip_type: tripType,
    total_amount: totalAmount,
    time_to_select_seconds: secondsSince(selectionStartedAt),
    currency: CURRENCY,
  })
}

/**
 * @param {Object} params
 * @param {string} params.searchId
 * @param {string} params.bookingId
 * @param {import("../../types/domain").TripType} params.tripType
 * @param {number} params.totalAmount
 * @param {number} params.passengerTotalCount
 */
export function trackCheckoutStarted({
  searchId,
  bookingId,
  tripType,
  totalAmount,
  passengerTotalCount,
}) {
  ampli.checkoutStarted({
    ...baseProperties(),
    search_id: searchId,
    booking_id: bookingId,
    trip_type: tripType,
    total_amount: totalAmount,
    passenger_total_count: passengerTotalCount,
    currency: CURRENCY,
  })
}

/**
 * @param {Object} params
 * @param {string} params.bookingId
 * @param {number} params.passengerTotalCount
 */
export function trackPassengerDetailsStarted({ bookingId, passengerTotalCount }) {
  passengerStartedAt = Date.now()
  ampli.passengerDetailsStarted({
    ...baseProperties(),
    booking_id: bookingId,
    passenger_total_count: passengerTotalCount,
  })
}

/**
 * @param {Object} params
 * @param {string} params.bookingId
 * @param {'firstName'|'lastName'|'birthDate'|'documentNumber'|'email'|'phone'} params.fieldName
 * @param {'required'|'invalid_format'} params.errorType
 * @param {number} params.attemptCount
 */
export function trackPassengerDetailsValidationFailed({
  bookingId,
  fieldName,
  errorType,
  attemptCount,
}) {
  ampli.passengerDetailsValidationFailed({
    ...baseProperties(),
    booking_id: bookingId,
    field_name: FIELD_NAME_BY_FORM_FIELD[fieldName],
    error_type: errorType,
    attempt_count: attemptCount,
  })
}

/**
 * Intent event: metadata only — no name, document, or contact ever leaves
 * the form (specs.md RS-01).
 * @param {Object} params
 * @param {string} params.bookingId
 * @param {import("../../types/domain").Passenger[]} params.passengers
 */
export function trackPassengerDetailsSubmitted({ bookingId, passengers }) {
  ampli.passengerDetailsSubmitted({
    ...baseProperties(),
    booking_id: bookingId,
    document_type: documentTypeOf(passengers[0].documentNumber),
    passenger_total_count: passengers.length,
    // RF-01: only adult passengers are bookable today
    has_infant: false,
    time_to_complete_seconds: secondsSince(passengerStartedAt),
  })
}

/**
 * @param {Object} params
 * @param {string} params.bookingId
 * @param {import("../../types/domain").PriceBreakdown} params.breakdown
 */
export function trackBookingReviewViewed({ bookingId, breakdown }) {
  ampli.bookingReviewViewed({
    ...baseProperties(),
    booking_id: bookingId,
    base_fare_amount: breakdown.fareTotal,
    taxes_amount: breakdown.taxesTotal,
    total_amount: breakdown.grandTotal,
    currency: CURRENCY,
  })
}

/**
 * @param {Object} params
 * @param {string} params.bookingId
 * @param {number} params.totalAmount
 */
export function trackBookingDetailsConfirmed({ bookingId, totalAmount }) {
  ampli.bookingDetailsConfirmed({
    ...baseProperties(),
    booking_id: bookingId,
    total_amount: totalAmount,
    currency: CURRENCY,
  })
}

/**
 * @param {Object} params
 * @param {string} params.bookingId
 * @param {import("../../types/domain").PaymentMethod} params.method
 * @param {number} [params.milesUsedCount]
 */
export function trackPaymentMethodSelected({ bookingId, method, milesUsedCount }) {
  ampli.paymentMethodSelected({
    ...baseProperties(),
    booking_id: bookingId,
    payment_method: method,
    miles_used_count: milesUsedCount,
  })
}

/**
 * Intent event: no card number, CVV or Pix key is ever sent (RS-02).
 * @param {Object} params
 * @param {string} params.bookingId
 * @param {import("../../types/domain").PaymentDetails} params.payment
 * @param {number} params.totalAmount
 */
export function trackPaymentDetailsSubmitted({ bookingId, payment, totalAmount }) {
  ampli.paymentDetailsSubmitted({
    ...baseProperties(),
    booking_id: bookingId,
    payment_method: payment.method,
    card_brand: payment.cardBrand,
    installment_count: payment.installments,
    total_amount: totalAmount,
    currency: CURRENCY,
  })
}

/**
 * Outcome event: fires only from the mock-api's rejection, never
 * optimistically.
 * @param {Object} params
 * @param {string} params.bookingId
 * @param {import("../../types/domain").PaymentDetails} params.payment
 * @param {number} params.totalAmount
 * @param {number} params.attemptCount
 * @param {string} [params.mockErrorType]
 */
export function trackPaymentFailed({
  bookingId,
  payment,
  totalAmount,
  attemptCount,
  mockErrorType,
}) {
  ampli.paymentFailed({
    ...baseProperties(),
    booking_id: bookingId,
    payment_method: payment.method,
    total_amount: totalAmount,
    attempt_count: attemptCount,
    failure_reason: FAILURE_REASON_BY_ERROR[mockErrorType] ?? "gateway_timeout",
    currency: CURRENCY,
  })
}

/**
 * Outcome event and the only one authorized to carry revenue. Fires only
 * after the mock-api confirms the payment, with a deterministic insert_id
 * (the order_id) so a retried delivery can never double-count revenue.
 * @param {Object} params
 * @param {import("../../types/domain").Order} params.order
 * @param {import("../../types/domain").SearchCriteria} params.criteria
 * @param {import("../../types/domain").SearchResults} params.results
 * @param {import("../../types/domain").SelectedTrip} params.selectedTrip
 * @param {import("../../types/domain").Passenger[]} params.passengers
 * @param {import("../../types/domain").PaymentDetails} params.payment
 * @param {import("../../types/domain").PriceBreakdown} params.breakdown
 */
export function trackPurchaseCompleted({
  order,
  criteria,
  results,
  selectedTrip,
  passengers,
  payment,
  breakdown,
}) {
  const outboundFare = findFareFamily(
    findOffer(results.outboundOffers, selectedTrip.outboundFlightNumber),
    selectedTrip.outboundFareFamilyId
  )

  ampli.purchaseCompleted(
    {
      ...baseProperties(),
      order_id: order.orderId,
      booking_id: order.bookingId,
      booking_reference: order.pnr,
      search_id: results.searchId,
      trip_type: criteria.tripType,
      origin_iata: criteria.originIata,
      destination_iata: criteria.destinationIata,
      cabin_class: criteria.cabinClass,
      days_to_departure: daysToDeparture(criteria.departureDate),
      is_domestic: isDomestic(criteria.originIata, criteria.destinationIata),
      fare_family: FARE_FAMILY_BY_ID[outboundFare.id],
      base_fare_amount: breakdown.fareTotal,
      taxes_amount: breakdown.taxesTotal,
      revenue: breakdown.grandTotal,
      passenger_total_count: passengers.length,
      payment_method: payment.method,
      installment_count: payment.installments,
      time_to_purchase_seconds: secondsSince(searchSubmittedAt),
      currency: CURRENCY,
    },
    { insert_id: order.orderId }
  )
}

/**
 * @param {Object} params
 * @param {string} params.bookingId
 * @param {string} params.bookingReference
 */
export function trackBookingConfirmationViewed({ bookingId, bookingReference }) {
  ampli.bookingConfirmationViewed({
    ...baseProperties(),
    booking_id: bookingId,
    booking_reference: bookingReference,
  })
}
