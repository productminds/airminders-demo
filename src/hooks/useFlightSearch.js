import { useCallback, useState } from "react"
import { searchFlights } from "../services/mock-api"
import { useJourney } from "../context/JourneyContext"

/**
 * RF-01/12/13: orchestrates a flight search against the mock-api, tracking
 * loading/error state so a failure never surfaces as an unhandled error
 * (RNF-02).
 * @returns {{
 *   status: "idle"|"loading"|"success"|"error",
 *   results: import("../types/domain").SearchResults | null,
 *   error: import("../services/mock-api/errors").MockApiError | null,
 *   submitSearch: (criteria: Omit<import("../types/domain").SearchCriteria, "searchId">) => Promise<void>,
 * }}
 */
export function useFlightSearch() {
  const { createSearchId } = useJourney()
  const [status, setStatus] = useState("idle")
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const submitSearch = useCallback(
    async (criteria) => {
      const searchId = createSearchId()
      setStatus("loading")
      setError(null)

      try {
        const searchResults = await searchFlights({ ...criteria, searchId })
        setResults(searchResults)
        setStatus("success")
      } catch (caughtError) {
        setError(caughtError)
        setStatus("error")
      }
    },
    [createSearchId]
  )

  return { status, results, error, submitSearch }
}
