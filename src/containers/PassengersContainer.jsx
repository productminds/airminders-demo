import { useEffect, useState } from "react"
import { Navigate, useNavigate, useOutletContext } from "react-router-dom"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import PassengerForm from "@/components/passengers/PassengerForm"
import { usePassengerSubmit } from "@/hooks/usePassengerSubmit"
import { useJourney } from "@/context/JourneyContext"
import { validatePassenger } from "@/lib/validators"
import { generateId } from "@/lib/ids"

function emptyPassenger() {
  return {
    passengerId: generateId("passenger"),
    firstName: "",
    lastName: "",
    birthDate: "",
    documentNumber: "",
    email: "",
    phone: "",
  }
}

/**
 * RF-07/12: step 3 — collects one form per adult passenger, validates
 * required fields client-side, then submits to the mock-api for a
 * server-style re-validation pass (RS-01: nothing sensitive ever touches
 * a URL, log, or persisted storage).
 */
export default function PassengersContainer() {
  const navigate = useNavigate()
  const { bookingId } = useJourney()
  const { criteria, selectedTrip, setPassengers } = useOutletContext()
  const { status, error, submit } = usePassengerSubmit()

  const [passengerList, setPassengerList] = useState(() =>
    Array.from({ length: criteria?.passengerAdultCount ?? 1 }, emptyPassenger)
  )
  const [clientErrors, setClientErrors] = useState({})

  useEffect(() => {
    if (status !== "success") return
    setPassengers(passengerList)
    navigate("/revisao")
    // passengerList is intentionally excluded: it must reflect the exact
    // payload that was submitted, not whatever the user has typed since.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, setPassengers, navigate])

  if (!criteria || !selectedTrip) {
    return <Navigate to="/selecionar" replace />
  }

  function updatePassenger(index, nextPassenger) {
    setPassengerList((current) =>
      current.map((passenger, i) => (i === index ? nextPassenger : passenger))
    )
  }

  function errorsForPassenger(passengerId) {
    const fromClient = clientErrors[passengerId] ?? []
    const fromServer = (error?.fieldErrors ?? []).filter(
      (fieldError) => fieldError.passengerId === passengerId
    )
    return [...fromClient, ...fromServer]
  }

  function handleSubmit(event) {
    event.preventDefault()

    const nextClientErrors = {}
    let hasClientErrors = false
    for (const passenger of passengerList) {
      const fieldErrors = validatePassenger(passenger)
      if (fieldErrors.length > 0) {
        nextClientErrors[passenger.passengerId] = fieldErrors
        hasClientErrors = true
      }
    }
    setClientErrors(nextClientErrors)
    if (hasClientErrors) return

    submit({ bookingId, passengers: passengerList })
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6" noValidate>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold sm:text-3xl">Dados dos passageiros</h1>
        <p className="text-muted-foreground">
          Preencha os dados exatamente como no documento de viagem.
        </p>
      </div>

      {status === "error" && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Não foi possível validar os dados</AlertTitle>
          <AlertDescription>
            Revise os campos destacados e tente novamente.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {passengerList.map((passenger, index) => (
          <PassengerForm
            key={passenger.passengerId}
            index={index}
            passenger={passenger}
            errors={errorsForPassenger(passenger.passengerId)}
            onChange={(next) => updatePassenger(index, next)}
          />
        ))}
      </div>

      <div className="flex justify-end border-t pt-6">
        <Button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Validando..." : "Continuar"}
        </Button>
      </div>
    </form>
  )
}
