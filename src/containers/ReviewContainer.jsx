import { Navigate, useNavigate, useOutletContext } from "react-router-dom"
import { Button } from "@/components/ui/button"
import ItineraryLegSummary from "@/components/review/ItineraryLegSummary"
import PassengerListSummary from "@/components/review/PassengerListSummary"
import PriceSummary from "@/components/review/PriceSummary"
import { computePriceBreakdown, findFareFamily, findOffer } from "@/lib/pricing"

/**
 * RF-08: step 4 — review itinerary, passengers and price composition
 * before payment. Purely derived from state already gathered in earlier
 * steps, so it needs no mock-api call of its own.
 */
export default function ReviewContainer() {
  const navigate = useNavigate()
  const { criteria, results, selectedTrip, passengers } = useOutletContext()

  if (!criteria || !results || !selectedTrip || !passengers) {
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

  const breakdown = computePriceBreakdown({
    results,
    selectedTrip,
    passengerCount: passengers.length,
  })

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold sm:text-3xl">Revise sua reserva</h1>
        <p className="text-muted-foreground">
          Confira os dados antes de seguir para o pagamento.
        </p>
      </div>

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
      <PriceSummary breakdown={breakdown} />

      <div className="flex justify-end border-t pt-6">
        <Button onClick={() => navigate("/pagamento")}>Ir para pagamento</Button>
      </div>
    </div>
  )
}
