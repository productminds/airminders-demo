import { useCallback, useState } from "react"
import { Outlet } from "react-router-dom"
import StepIndicator from "@/components/layout/StepIndicator"

/**
 * Owns the flow's step-to-step data (search criteria, results, selected
 * trip, passengers, order) as local state lifted only as far as the flow
 * root — the exception is the journey correlation IDs, which live in
 * JourneyContext per specs.md §4.2 (see CLAUDE.md §6).
 */
export default function BookingFlowLayout() {
  const [criteria, setCriteria] = useState(null)
  const [results, setResults] = useState(null)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [passengers, setPassengers] = useState(null)
  const [order, setOrder] = useState(null)

  const resetAfterSearch = useCallback(() => {
    setSelectedTrip(null)
    setPassengers(null)
    setOrder(null)
  }, [])

  const resetFlow = useCallback(() => {
    setCriteria(null)
    setResults(null)
    setSelectedTrip(null)
    setPassengers(null)
    setOrder(null)
  }, [])

  return (
    <div className="mx-auto flex min-h-svh max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <StepIndicator />
      <main className="flex-1 py-6">
        <Outlet
          context={{
            criteria,
            setCriteria,
            results,
            setResults,
            selectedTrip,
            setSelectedTrip,
            passengers,
            setPassengers,
            order,
            setOrder,
            resetAfterSearch,
            resetFlow,
          }}
        />
      </main>
    </div>
  )
}
