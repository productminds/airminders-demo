/**
 * Domain shapes shared across components, hooks and services/mock-api.
 * RT-06: no TypeScript in this project, so consistency is enforced via
 * JSDoc @typedef instead of compiler types.
 */

export const TRIP_TYPES = /** @type {const} */ (["one_way", "round_trip"])

export const CABIN_CLASSES = /** @type {const} */ ([
  "economy",
  "premium_economy",
  "business",
])

export const PAYMENT_METHODS = /** @type {const} */ (["credit_card", "pix", "miles"])

export const CABIN_CLASS_LABELS = {
  economy: "Econômica",
  premium_economy: "Econômica Premium",
  business: "Executiva",
}

export const PAYMENT_METHOD_LABELS = {
  credit_card: "Cartão de crédito",
  pix: "Pix",
  miles: "Milhas",
}

/**
 * @typedef {"one_way"|"round_trip"} TripType
 * @typedef {"economy"|"premium_economy"|"business"} CabinClass
 * @typedef {"credit_card"|"pix"|"miles"} PaymentMethod
 */

/**
 * @typedef {Object} Airport
 * @property {string} iataCode
 * @property {string} city
 * @property {string} country
 */

/**
 * @typedef {Object} SearchCriteria
 * @property {string} searchId
 * @property {TripType} tripType
 * @property {string} originIata
 * @property {string} destinationIata
 * @property {string} departureDate - YYYY-MM-DD
 * @property {string} [returnDate] - YYYY-MM-DD, required when tripType is round_trip
 * @property {number} passengerAdultCount
 * @property {CabinClass} cabinClass
 */

/**
 * @typedef {Object} FareFamily
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {string} currency
 * @property {string[]} benefits
 */

/**
 * @typedef {Object} FlightOffer
 * @property {string} flightNumber
 * @property {string} airline
 * @property {string} originIata
 * @property {string} destinationIata
 * @property {string} departureTime - ISO datetime
 * @property {string} arrivalTime - ISO datetime
 * @property {number} durationMinutes
 * @property {number} stops
 * @property {FareFamily[]} fareFamilies
 */

/**
 * @typedef {Object} SearchResults
 * @property {string} searchId
 * @property {FlightOffer[]} outboundOffers
 * @property {FlightOffer[]} [inboundOffers]
 */

/**
 * @typedef {Object} SelectedTrip
 * @property {string} outboundFlightNumber
 * @property {string} outboundFareFamilyId
 * @property {string} [inboundFlightNumber]
 * @property {string} [inboundFareFamilyId]
 */

/**
 * @typedef {Object} Passenger
 * @property {string} passengerId
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} birthDate - YYYY-MM-DD
 * @property {string} documentNumber
 * @property {string} email
 * @property {string} phone
 */

/**
 * @typedef {Object} PriceBreakdown
 * @property {number} fareTotal
 * @property {number} taxesTotal
 * @property {number} grandTotal
 * @property {string} currency
 */

/**
 * @typedef {Object} PaymentDetails
 * @property {PaymentMethod} method
 * @property {number} [installments] - only for credit_card
 * @property {string} [cardHolderName] - mocked, never persisted (RS-02)
 * @property {string} [cardLast4] - mocked, never persisted (RS-02)
 */

/**
 * @typedef {Object} Order
 * @property {string} orderId
 * @property {string} bookingId
 * @property {string} pnr
 * @property {"confirmed"} status
 */
