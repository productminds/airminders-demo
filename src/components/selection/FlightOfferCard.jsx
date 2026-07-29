import PropTypes from "prop-types"
import { Plane } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, formatDuration, formatStops, formatTime } from "@/lib/format"

/**
 * RF-03/05/06: one flight offer with its per-fare-family prices. Selecting
 * a fare family button chooses both the flight and the fare for this leg.
 */
export default function FlightOfferCard({ offer, selectedFareFamilyId, onSelectFare }) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Plane className="h-3.5 w-3.5" aria-hidden="true" />
            {offer.airline} · {offer.flightNumber}
          </span>
          <span>{formatStops(offer.stops)}</span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold">{formatTime(offer.departureTime)}</p>
            <p className="text-sm text-muted-foreground">{offer.originIata}</p>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">
              {formatDuration(offer.durationMinutes)}
            </span>
            <div className="h-px w-full bg-border" />
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{formatTime(offer.arrivalTime)}</p>
            <p className="text-sm text-muted-foreground">{offer.destinationIata}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {offer.fareFamilies.map((fareFamily) => {
            const isSelected = selectedFareFamilyId === fareFamily.id

            return (
              <button
                key={fareFamily.id}
                type="button"
                onClick={() => onSelectFare(offer.flightNumber, fareFamily.id)}
                aria-pressed={isSelected}
                className={cn(
                  "rounded-md border p-3 text-left transition-colors",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <p className="text-sm font-medium">{fareFamily.name}</p>
                <p className="text-base font-semibold text-primary">
                  {formatCurrency(fareFamily.price)}
                </p>
                <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                  {fareFamily.benefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

FlightOfferCard.propTypes = {
  offer: PropTypes.shape({
    flightNumber: PropTypes.string.isRequired,
    airline: PropTypes.string.isRequired,
    originIata: PropTypes.string.isRequired,
    destinationIata: PropTypes.string.isRequired,
    departureTime: PropTypes.string.isRequired,
    arrivalTime: PropTypes.string.isRequired,
    durationMinutes: PropTypes.number.isRequired,
    stops: PropTypes.number.isRequired,
    fareFamilies: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        benefits: PropTypes.arrayOf(PropTypes.string).isRequired,
      })
    ).isRequired,
  }).isRequired,
  selectedFareFamilyId: PropTypes.string,
  onSelectFare: PropTypes.func.isRequired,
}

FlightOfferCard.defaultProps = {
  selectedFareFamilyId: null,
}
