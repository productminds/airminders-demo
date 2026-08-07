import { Navigate, useNavigate, useOutletContext } from "react-router-dom"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ItineraryLegSummary from "@/components/review/ItineraryLegSummary"
import PassengerListSummary from "@/components/review/PassengerListSummary"
import { findFareFamily, findOffer } from "@/lib/pricing"
import { useTrackOnMount } from "@/hooks/useTrackOnMount"
import { trackBookingConfirmationViewed } from "@/services/analytics"

/**
 * RF-11: step 6 — reservation locator (PNR) and purchase confirmation.
 */
export default function ConfirmationContainer() {
  const navigate = useNavigate()
  const { results, selectedTrip, passengers, order, resetFlow } = useOutletContext()

  useTrackOnMount(() => {
    if (!order) return
    trackBookingConfirmationViewed({
      bookingId: order.bookingId,
      bookingReference: order.pnr,
    })
  })

  if (!results || !selectedTrip || !passengers || !order) {
    return <Navigate to="/buscar" replace />
  }

  const outboundOffer = findOffer(
    results.outboundOffers,
    selectedTrip.outboundFlightNumber
  )
  const outboundFare = findFareFamily(outboundOffer, selectedTrip.outboundFareFamilyId)
  const inboundOffer = selectedTrip.inboundFlightNumber
    ? findOffer(results.inboundOffers, selectedTrip.inboundFlightNumber)
    : undefined
  const inboundFare = findFareFamily(inboundOffer, selectedTrip.inboundFareFamilyId)

  function handleNewSearch() {
    resetFlow()
    navigate("/buscar")
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center sm:p-8">
          <CheckCircle2 className="h-12 w-12 text-success" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">Reserva confirmada!</h1>
            <p className="mt-1 text-muted-foreground">Seu localizador de reserva é</p>
          </div>
          <p className="text-4xl font-bold tracking-[0.3em] text-primary">{order.pnr}</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <ItineraryLegSummary
          title="Ida"
          offer={outboundOffer}
          fareFamily={outboundFare}
        />
        {inboundOffer && (
          <ItineraryLegSummary
            title="Volta"
            offer={inboundOffer}
            fareFamily={inboundFare}
          />
        )}
      </div>

      <PassengerListSummary passengers={passengers} />

      <div className="flex justify-end border-t pt-6">
        <Button onClick={handleNewSearch}>Nova busca</Button>
      </div>
    </div>
  )
}
