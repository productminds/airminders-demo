import { useCallback, useEffect, useRef, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import StepIndicator from "@/components/layout/StepIndicator"
import { ampli } from "@/ampli"
import packageJson from "../../package.json"

/**
 * Screen Viewed: booking_step/screen_name per route. Every step of the
 * funnel is a child route of this layout, so it's the single place that
 * sees every navigation — one tracking call here instead of one per
 * container.
 */
const SCREEN_BY_PATH = {
  "/buscar": { screen_name: "home", booking_step: "search" },
  "/selecionar": { screen_name: "flight_selection", booking_step: "select" },
  "/passageiros": { screen_name: "passenger_details", booking_step: "passenger" },
  "/revisao": { screen_name: "booking_review", booking_step: "review" },
  "/pagamento": { screen_name: "payment", booking_step: "payment" },
  "/confirmacao": { screen_name: "confirmation", booking_step: "confirmation" },
}

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

  const location = useLocation()
  const referrerScreen = useRef(undefined)

  useEffect(() => {
    const screen = SCREEN_BY_PATH[location.pathname]
    if (!screen) return

    ampli.screenViewed({
      app_version: packageJson.version,
      booking_step: screen.booking_step,
      environment: import.meta.env.DEV ? "development" : "production",
      locale: navigator.language,
      platform: "web",
      referrer_screen: referrerScreen.current,
      screen_name: screen.screen_name,
    })
    referrerScreen.current = screen.screen_name
  }, [location.pathname])

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
