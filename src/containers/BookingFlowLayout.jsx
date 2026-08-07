import { useCallback, useEffect, useRef, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import StepIndicator from "@/components/layout/StepIndicator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { trackLogoClicked, trackScreenViewed } from "@/services/analytics"

/**
 * Screen Viewed: booking_step/screen_name per route. Every step of the
 * funnel is a child route of this layout, so it's the single place that
 * sees every navigation — one tracking call here instead of one per
 * container.
 */
const SCREEN_BY_PATH = {
  "/buscar": { screenName: "home", bookingStep: "search" },
  "/selecionar": { screenName: "flight_selection", bookingStep: "select" },
  "/passageiros": { screenName: "passenger_details", bookingStep: "passenger" },
  "/revisao": { screenName: "booking_review", bookingStep: "review" },
  "/pagamento": { screenName: "payment", bookingStep: "payment" },
  "/confirmacao": { screenName: "confirmation", bookingStep: "confirmation" },
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
  const [showRestartDialog, setShowRestartDialog] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const referrerScreen = useRef(undefined)
  const lastTrackedPath = useRef(null)

  useEffect(() => {
    const screen = SCREEN_BY_PATH[location.pathname]
    // Path dedupe guards against StrictMode's double-invoked dev effects
    if (!screen || lastTrackedPath.current === location.pathname) return

    lastTrackedPath.current = location.pathname
    trackScreenViewed({
      screenName: screen.screenName,
      bookingStep: screen.bookingStep,
      referrerScreen: referrerScreen.current,
    })
    referrerScreen.current = screen.screenName
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

  function handleLogoClick(event) {
    trackLogoClicked({ screenName: SCREEN_BY_PATH[location.pathname]?.screenName })

    // A journey in progress is lost by restarting, so ask first. A
    // completed journey (order issued) has nothing to lose — reset and go.
    if (criteria && !order) {
      event.preventDefault()
      setShowRestartDialog(true)
    } else if (order) {
      resetFlow()
    }
  }

  function confirmRestart() {
    setShowRestartDialog(false)
    resetFlow()
    navigate("/")
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <StepIndicator onLogoClick={handleLogoClick} />
      <AlertDialog open={showRestartDialog} onOpenChange={setShowRestartDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Começar uma nova busca?</AlertDialogTitle>
            <AlertDialogDescription>
              Você perderá o progresso desta reserva.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar reserva</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestart}>Nova busca</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
