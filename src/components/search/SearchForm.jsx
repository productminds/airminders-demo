import { useState } from "react"
import PropTypes from "prop-types"
import { ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AIRPORTS } from "@/services/mock-api"
import { CABIN_CLASSES, CABIN_CLASS_LABELS } from "@/types/domain"

const today = new Date().toISOString().slice(0, 10)

const initialForm = {
  tripType: "round_trip",
  originIata: "GRU",
  destinationIata: "GIG",
  departureDate: "",
  returnDate: "",
  passengerAdultCount: 1,
  cabinClass: "economy",
}

/**
 * RF-01/02: pure presentational search form. Field-level required
 * validation lives here for immediate feedback; the actual search call is
 * orchestrated by the container via useFlightSearch.
 */
export default function SearchForm({ onSubmit, isSubmitting }) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function swapAirports() {
    setForm((current) => ({
      ...current,
      originIata: current.destinationIata,
      destinationIata: current.originIata,
    }))
  }

  function validate() {
    const nextErrors = {}
    if (form.originIata === form.destinationIata) {
      nextErrors.destinationIata = "Origem e destino devem ser diferentes."
    }
    if (!form.departureDate) {
      nextErrors.departureDate = "Informe a data de ida."
    }
    if (form.tripType === "round_trip") {
      if (!form.returnDate) {
        nextErrors.returnDate = "Informe a data de volta."
      } else if (form.departureDate && form.returnDate < form.departureDate) {
        nextErrors.returnDate = "A volta não pode ser antes da ida."
      }
    }
    return nextErrors
  }

  function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    onSubmit({
      tripType: form.tripType,
      originIata: form.originIata,
      destinationIata: form.destinationIata,
      departureDate: form.departureDate,
      returnDate: form.tripType === "round_trip" ? form.returnDate : undefined,
      passengerAdultCount: Number(form.passengerAdultCount),
      cabinClass: form.cabinClass,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <RadioGroup
        value={form.tripType}
        onValueChange={(value) => updateField("tripType", value)}
        className="flex gap-6"
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="round_trip" id="trip-round" />
          <Label htmlFor="trip-round">Ida e volta</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="one_way" id="trip-oneway" />
          <Label htmlFor="trip-oneway">Somente ida</Label>
        </div>
      </RadioGroup>

      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <div className="space-y-2">
          <Label htmlFor="origin">Origem</Label>
          <Select
            value={form.originIata}
            onValueChange={(value) => updateField("originIata", value)}
          >
            <SelectTrigger id="origin">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AIRPORTS.map((airport) => (
                <SelectItem key={airport.iataCode} value={airport.iataCode}>
                  {airport.city} ({airport.iataCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={swapAirports}
          aria-label="Trocar origem e destino"
          className="mb-0.5 justify-self-center"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>

        <div className="space-y-2">
          <Label htmlFor="destination">Destino</Label>
          <Select
            value={form.destinationIata}
            onValueChange={(value) => updateField("destinationIata", value)}
          >
            <SelectTrigger
              id="destination"
              aria-invalid={Boolean(errors.destinationIata)}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AIRPORTS.map((airport) => (
                <SelectItem key={airport.iataCode} value={airport.iataCode}>
                  {airport.city} ({airport.iataCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.destinationIata && (
            <p className="text-sm text-destructive">{errors.destinationIata}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="departureDate">Data de ida</Label>
          <Input
            id="departureDate"
            type="date"
            min={today}
            value={form.departureDate}
            onChange={(event) => updateField("departureDate", event.target.value)}
            aria-invalid={Boolean(errors.departureDate)}
          />
          {errors.departureDate && (
            <p className="text-sm text-destructive">{errors.departureDate}</p>
          )}
        </div>

        {form.tripType === "round_trip" && (
          <div className="space-y-2">
            <Label htmlFor="returnDate">Data de volta</Label>
            <Input
              id="returnDate"
              type="date"
              min={form.departureDate || today}
              value={form.returnDate}
              onChange={(event) => updateField("returnDate", event.target.value)}
              aria-invalid={Boolean(errors.returnDate)}
            />
            {errors.returnDate && (
              <p className="text-sm text-destructive">{errors.returnDate}</p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="passengers">Passageiros</Label>
          <Input
            id="passengers"
            type="number"
            min={1}
            max={9}
            value={form.passengerAdultCount}
            onChange={(event) => updateField("passengerAdultCount", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cabinClass">Classe</Label>
          <Select
            value={form.cabinClass}
            onValueChange={(value) => updateField("cabinClass", value)}
          >
            <SelectTrigger id="cabinClass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CABIN_CLASSES.map((cabinClass) => (
                <SelectItem key={cabinClass} value={cabinClass}>
                  {CABIN_CLASS_LABELS[cabinClass]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? "Buscando..." : "Buscar voos"}
      </Button>
    </form>
  )
}

SearchForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
}
