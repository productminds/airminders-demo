import { useMemo, useState } from "react"
import PropTypes from "prop-types"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import FlightOfferCard from "./FlightOfferCard"

const SORT_OPTIONS = [
  { value: "price", label: "Menor preço" },
  { value: "duration", label: "Menor duração" },
  { value: "stops", label: "Menos paradas" },
]

function cheapestPrice(offer) {
  return Math.min(...offer.fareFamilies.map((fareFamily) => fareFamily.price))
}

const SORTERS = {
  price: (a, b) => cheapestPrice(a) - cheapestPrice(b),
  duration: (a, b) => a.durationMinutes - b.durationMinutes,
  stops: (a, b) => a.stops - b.stops,
}

/**
 * RF-04: sort and filter results (desirable requirement). RF-05/06: each
 * leg's offers are selected independently from the other leg.
 */
export default function OffersLegSection({
  title,
  offers,
  selectedFlightNumber,
  selectedFareFamilyId,
  onSelectFare,
  onFilterApplied,
}) {
  const [sortBy, setSortBy] = useState("price")
  const [directOnly, setDirectOnly] = useState(false)

  const visibleOffers = useMemo(() => {
    const filtered = directOnly ? offers.filter((offer) => offer.stops === 0) : offers
    return [...filtered].sort(SORTERS[sortBy])
  }, [offers, sortBy, directOnly])

  function visibleCount(direct) {
    return direct ? offers.filter((offer) => offer.stops === 0).length : offers.length
  }

  function handleSortChange(value) {
    setSortBy(value)
    onFilterApplied?.({
      filterType: value,
      sortBy: value,
      resultCountAfter: visibleCount(directOnly),
    })
  }

  function handleDirectOnlyChange(checked) {
    const next = checked === true
    setDirectOnly(next)
    onFilterApplied?.({ filterType: "stops", resultCountAfter: visibleCount(next) })
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`direct-only-${title}`}
              checked={directOnly}
              onCheckedChange={handleDirectOnlyChange}
            />
            <Label htmlFor={`direct-only-${title}`} className="text-sm font-normal">
              Somente voos diretos
            </Label>
          </div>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-44" aria-label="Ordenar resultados">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {visibleOffers.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Nenhum voo encontrado para este trecho com os filtros atuais.
        </p>
      ) : (
        <div className="space-y-3">
          {visibleOffers.map((offer, index) => (
            <FlightOfferCard
              key={offer.flightNumber}
              offer={offer}
              selectedFareFamilyId={
                selectedFlightNumber === offer.flightNumber ? selectedFareFamilyId : null
              }
              onSelectFare={(flightNumber, fareFamilyId) =>
                onSelectFare(flightNumber, fareFamilyId, index + 1)
              }
            />
          ))}
        </div>
      )}
    </section>
  )
}

OffersLegSection.propTypes = {
  title: PropTypes.string.isRequired,
  offers: PropTypes.array.isRequired,
  selectedFlightNumber: PropTypes.string,
  selectedFareFamilyId: PropTypes.string,
  onSelectFare: PropTypes.func.isRequired,
  onFilterApplied: PropTypes.func,
}

OffersLegSection.defaultProps = {
  selectedFlightNumber: null,
  selectedFareFamilyId: null,
}
