import { useCallback, useState } from "react"
import { searchFlights } from "../services/mock-api"
import { useJourney } from "../context/JourneyContext"
import {
  trackFlightSearchFailed,
  trackFlightSearchResultsViewed,
  trackFlightSearchSubmitted,
} from "../services/analytics"

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
      const fullCriteria = { ...criteria, searchId }
      setStatus("loading")
      setError(null)

      // Intent event: fires on submit; outcome events below fire only from
      // the mock-api's actual response — never optimistically.
      trackFlightSearchSubmitted(fullCriteria)
      const startedAt = performance.now()

      try {
        const searchResults = await searchFlights(fullCriteria)
        trackFlightSearchResultsViewed({
          results: searchResults,
          searchLatencyMs: Math.round(performance.now() - startedAt),
        })
        if (searchResults.outboundOffers.length === 0) {
          trackFlightSearchFailed({ searchId, errorType: "no_results" })
        }
        setResults(searchResults)
        setStatus("success")
      } catch (caughtError) {
        trackFlightSearchFailed({
          searchId,
          errorType: caughtError.type === "timeout" ? "timeout" : "unexpected_error",
          errorCode: caughtError.type,
        })
        setError(caughtError)
        setStatus("error")
      }
    },
    [createSearchId]
  )

  return { status, results, error, submitSearch }
}
