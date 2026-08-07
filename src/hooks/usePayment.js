import { useCallback, useState } from "react"
import { submitPayment } from "../services/mock-api"

/**
 * RF-09/11/12: authorizes payment against the mock-api and, on success,
 * mints the order_id client-side (specs.md §4.2) at the moment of
 * purchase confirmation. Besides setting state, `pay` resolves with the
 * outcome so the caller can track it against the actual mock-api response.
 * @returns {{
 *   status: "idle"|"loading"|"success"|"error",
 *   order: import("../types/domain").Order | null,
 *   error: import("../services/mock-api/errors").MockApiError | null,
 *   pay: (params: { bookingId: string, payment: import("../types/domain").PaymentDetails, createOrderId: () => string }) => Promise<{ order: import("../types/domain").Order | null, error: import("../services/mock-api/errors").MockApiError | null }>,
 * }}
 */
export function usePayment() {
  const [status, setStatus] = useState("idle")
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)

  const pay = useCallback(async ({ bookingId, payment, createOrderId }) => {
    setStatus("loading")
    setError(null)

    try {
      const { pnr, status: orderStatus } = await submitPayment({ bookingId, payment })
      const confirmedOrder = {
        orderId: createOrderId(),
        bookingId,
        pnr,
        status: orderStatus,
      }
      setOrder(confirmedOrder)
      setStatus("success")
      return { order: confirmedOrder, error: null }
    } catch (caughtError) {
      setError(caughtError)
      setStatus("error")
      return { order: null, error: caughtError }
    }
  }, [])

  return { status, order, error, pay }
}
