import { useCallback, useState } from "react"
import { submitPayment } from "../services/mock-api"

/**
 * RF-09/11/12: authorizes payment against the mock-api and, on success,
 * mints the order_id client-side (specs.md §4.2) at the moment of
 * purchase confirmation.
 * @returns {{
 *   status: "idle"|"loading"|"success"|"error",
 *   order: import("../types/domain").Order | null,
 *   error: import("../services/mock-api/errors").MockApiError | null,
 *   pay: (params: { bookingId: string, payment: import("../types/domain").PaymentDetails, createOrderId: () => string }) => Promise<void>,
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
      setOrder({ orderId: createOrderId(), bookingId, pnr, status: orderStatus })
      setStatus("success")
    } catch (caughtError) {
      setError(caughtError)
      setStatus("error")
    }
  }, [])

  return { status, order, error, pay }
}
