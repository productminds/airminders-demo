import PropTypes from "prop-types"
import { Plane } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate, formatDuration, formatStops, formatTime } from "@/lib/format"

export default function ItineraryLegSummary({ title, offer, fareFamily }) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{title}</span>
          <span className="flex items-center gap-1.5">
            <Plane className="h-3.5 w-3.5" aria-hidden="true" />
            {offer.airline} · {offer.flightNumber}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold">{formatTime(offer.departureTime)}</p>
            <p className="text-sm text-muted-foreground">
              {offer.originIata} · {formatDate(offer.departureTime)}
            </p>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">
              {formatDuration(offer.durationMinutes)} · {formatStops(offer.stops)}
            </span>
            <div className="h-px w-full bg-border" />
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{formatTime(offer.arrivalTime)}</p>
            <p className="text-sm text-muted-foreground">
              {offer.destinationIata} · {formatDate(offer.arrivalTime)}
            </p>
          </div>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          Tarifa <span className="font-medium text-foreground">{fareFamily.name}</span>
        </p>
      </CardContent>
    </Card>
  )
}

ItineraryLegSummary.propTypes = {
  title: PropTypes.string.isRequired,
  offer: PropTypes.shape({
    flightNumber: PropTypes.string.isRequired,
    airline: PropTypes.string.isRequired,
    originIata: PropTypes.string.isRequired,
    destinationIata: PropTypes.string.isRequired,
    departureTime: PropTypes.string.isRequired,
    arrivalTime: PropTypes.string.isRequired,
    durationMinutes: PropTypes.number.isRequired,
    stops: PropTypes.number.isRequired,
  }).isRequired,
  fareFamily: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
}
