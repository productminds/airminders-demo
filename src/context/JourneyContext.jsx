import { createContext, useCallback, useContext, useMemo, useState } from "react"
import PropTypes from "prop-types"
import { generateId } from "../lib/ids"

/**
 * specs.md §4.2: search_id/booking_id/order_id correlate the same
 * search/reservation across steps and screens. This is the one piece of
 * flow state that spans steps by nature, so it lives in a single Context
 * at the flow root instead of being prop-drilled or duplicated per step.
 */
const JourneyContext = createContext(null)

export function JourneyProvider({ children }) {
  const [searchId, setSearchId] = useState(null)
  const [bookingId, setBookingId] = useState(null)
  const [orderId, setOrderId] = useState(null)

  const createSearchId = useCallback(() => {
    const id = generateId("search")
    setSearchId(id)
    setBookingId(null)
    setOrderId(null)
    return id
  }, [])

  const ensureBookingId = useCallback(() => {
    if (bookingId) return bookingId
    const id = generateId("booking")
    setBookingId(id)
    return id
  }, [bookingId])

  const createOrderId = useCallback(() => {
    const id = generateId("order")
    setOrderId(id)
    return id
  }, [])

  const value = useMemo(
    () => ({
      searchId,
      bookingId,
      orderId,
      createSearchId,
      ensureBookingId,
      createOrderId,
    }),
    [searchId, bookingId, orderId, createSearchId, ensureBookingId, createOrderId]
  )

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
}

JourneyProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export function useJourney() {
  const context = useContext(JourneyContext)
  if (!context) {
    throw new Error("useJourney must be used within a JourneyProvider")
  }
  return context
}
