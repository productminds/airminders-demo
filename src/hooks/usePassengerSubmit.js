import { useCallback, useState } from "react"
import { submitPassengers } from "../services/mock-api"

/**
 * RF-07/12: submits passenger data for the (simulated) backend
 * re-validation pass, surfacing field-level errors instead of throwing
 * unhandled (RNF-02).
 * @returns {{
 *   status: "idle"|"loading"|"success"|"error",
 *   error: import("../services/mock-api/errors").MockApiError | null,
 *   submit: (params: { bookingId: string, passengers: import("../types/domain").Passenger[] }) => Promise<void>,
 * }}
 */
export function usePassengerSubmit() {
  const [status, setStatus] = useState("idle")
  const [error, setError] = useState(null)

  const submit = useCallback(async ({ bookingId, passengers }) => {
    setStatus("loading")
    setError(null)

    try {
      await submitPassengers({ bookingId, passengers })
      setStatus("success")
    } catch (caughtError) {
      setError(caughtError)
      setStatus("error")
    }
  }, [])

  return { status, error, submit }
}
