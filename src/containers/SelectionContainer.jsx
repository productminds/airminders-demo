import { Navigate, useNavigate, useOutletContext } from "react-router-dom"
import { SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import OffersLegSection from "@/components/selection/OffersLegSection"
import { useJourney } from "@/context/JourneyContext"

/**
 * RF-03/04/05/06: step 2 — independent outbound/inbound flight and fare
 * family selection.
 */
export default function SelectionContainer() {
  const navigate = useNavigate()
  const { ensureBookingId } = useJourney()
  const { criteria, results, selectedTrip, setSelectedTrip } = useOutletContext()

  if (!criteria || !results) {
    return <Navigate to="/buscar" replace />
  }

  const isRoundTrip = criteria.tripType === "round_trip"
  const hasOutbound = Boolean(selectedTrip?.outboundFareFamilyId)
  const hasInbound = !isRoundTrip || Boolean(selectedTrip?.inboundFareFamilyId)
  const canContinue = hasOutbound && hasInbound

  function selectOutbound(flightNumber, fareFamilyId) {
    setSelectedTrip((current) => ({
      ...current,
      outboundFlightNumber: flightNumber,
      outboundFareFamilyId: fareFamilyId,
    }))
  }

  function selectInbound(flightNumber, fareFamilyId) {
    setSelectedTrip((current) => ({
      ...current,
      inboundFlightNumber: flightNumber,
      inboundFareFamilyId: fareFamilyId,
    }))
  }

  function handleContinue() {
    ensureBookingId()
    navigate("/passageiros")
  }

  // RF-12: search must be able to return zero results (forced failure scenario)
  if (results.outboundOffers.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center">
        <SearchX className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <div>
          <h1 className="text-xl font-semibold">Nenhum voo encontrado</h1>
          <p className="mt-1 text-muted-foreground">
            Não encontramos voos para {criteria.originIata} → {criteria.destinationIata}{" "}
            nessa data. Tente ajustar sua busca.
          </p>
        </div>
        <Button onClick={() => navigate("/buscar")}>Nova busca</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold sm:text-3xl">Escolha seus voos</h1>
        <p className="text-muted-foreground">
          {criteria.originIata} → {criteria.destinationIata}
          {isRoundTrip ? ` → ${criteria.originIata}` : ""}
        </p>
      </div>

      <OffersLegSection
        title="Ida"
        offers={results.outboundOffers}
        selectedFlightNumber={selectedTrip?.outboundFlightNumber}
        selectedFareFamilyId={selectedTrip?.outboundFareFamilyId}
        onSelectFare={selectOutbound}
      />

      {isRoundTrip && (
        <OffersLegSection
          title="Volta"
          offers={results.inboundOffers ?? []}
          selectedFlightNumber={selectedTrip?.inboundFlightNumber}
          selectedFareFamilyId={selectedTrip?.inboundFareFamilyId}
          onSelectFare={selectInbound}
        />
      )}

      <div className="flex justify-end border-t pt-6">
        <Button onClick={handleContinue} disabled={!canContinue}>
          Continuar
        </Button>
      </div>
    </div>
  )
}
