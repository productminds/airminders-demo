import { useEffect } from "react"
import { Navigate, useNavigate, useOutletContext } from "react-router-dom"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import PaymentForm from "@/components/payment/PaymentForm"
import { usePayment } from "@/hooks/usePayment"
import { useJourney } from "@/context/JourneyContext"
import { computePriceBreakdown } from "@/lib/pricing"

/**
 * RF-09/10/11/12, RS-02: step 5 — payment authorization.
 */
export default function PaymentContainer() {
  const navigate = useNavigate()
  const { bookingId, createOrderId } = useJourney()
  const { results, selectedTrip, passengers, setOrder } = useOutletContext()
  const { status, order, error, pay } = usePayment()

  useEffect(() => {
    if (status !== "success" || !order) return
    setOrder(order)
    navigate("/confirmacao")
  }, [status, order, setOrder, navigate])

  if (!results || !selectedTrip || !passengers) {
    return <Navigate to="/buscar" replace />
  }

  const breakdown = computePriceBreakdown({
    results,
    selectedTrip,
    passengerCount: passengers.length,
  })

  function handleSubmit(payment) {
    pay({ bookingId, payment, createOrderId })
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold sm:text-3xl">Pagamento</h1>
        <p className="text-muted-foreground">Escolha como deseja pagar sua reserva.</p>
      </div>

      {status === "error" && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Pagamento não aprovado</AlertTitle>
          <AlertDescription>
            {error?.type === "payment_declined"
              ? "O pagamento foi recusado. Verifique os dados ou tente outro método."
              : "Ocorreu um erro inesperado ao processar o pagamento. Tente novamente."}
          </AlertDescription>
        </Alert>
      )}

      <PaymentForm
        totalAmount={breakdown.grandTotal}
        isSubmitting={status === "loading"}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
