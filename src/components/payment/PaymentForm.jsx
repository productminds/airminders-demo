import { useState } from "react"
import PropTypes from "prop-types"
import { QrCode, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/format"

const MOCK_MILES_BALANCE = 82000
const MOCK_MILES_PER_BRL = 35

const INSTALLMENT_OPTIONS = [1, 2, 3, 4, 5, 6, 10, 12]

/**
 * RS-02: only the brand ever leaves this component, derived from the
 * issuer prefix — never the number itself.
 * @param {string} cardNumber
 * @returns {'visa'|'mastercard'|'amex'|undefined}
 */
function detectCardBrand(cardNumber) {
  const digits = cardNumber.replace(/\D/g, "")
  if (/^4/.test(digits)) return "visa"
  if (/^5[1-5]/.test(digits)) return "mastercard"
  if (/^3[47]/.test(digits)) return "amex"
  return undefined
}

/**
 * RF-09/10, RS-02: collects a payment method (credit card, Pix or miles).
 * Card data is entirely mocked — only the last 4 digits ever leave this
 * component; the full number and CVV are never submitted or persisted.
 */
export default function PaymentForm({
  totalAmount,
  isSubmitting,
  onSubmit,
  onMethodSelected,
}) {
  const [method, setMethod] = useState("credit_card")
  const [cardNumber, setCardNumber] = useState("")
  const [cardHolderName, setCardHolderName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [installments, setInstallments] = useState("1")

  const canPayWithMiles = totalAmount * MOCK_MILES_PER_BRL <= MOCK_MILES_BALANCE
  const canSubmitCard =
    cardNumber.replace(/\D/g, "").length >= 12 &&
    cardHolderName.trim().length > 0 &&
    cardExpiry.trim().length > 0 &&
    cardCvv.trim().length >= 3

  function handleMethodChange(nextMethod) {
    setMethod(nextMethod)
    onMethodSelected?.({
      method: nextMethod,
      milesUsedCount:
        nextMethod === "miles" ? totalAmount * MOCK_MILES_PER_BRL : undefined,
    })
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (method === "credit_card") {
      onSubmit({
        method,
        installments: Number(installments),
        cardHolderName,
        cardLast4: cardNumber.replace(/\D/g, "").slice(-4),
        cardBrand: detectCardBrand(cardNumber),
      })
      return
    }

    onSubmit({ method })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={method} onValueChange={handleMethodChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="credit_card">Cartão</TabsTrigger>
          <TabsTrigger value="pix">Pix</TabsTrigger>
          <TabsTrigger value="miles">Milhas</TabsTrigger>
        </TabsList>

        <TabsContent value="credit_card" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Número do cartão</Label>
            <Input
              id="cardNumber"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={(event) => setCardNumber(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardHolderName">Nome impresso no cartão</Label>
            <Input
              id="cardHolderName"
              autoComplete="cc-name"
              value={cardHolderName}
              onChange={(event) => setCardHolderName(event.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cardExpiry">Validade</Label>
              <Input
                id="cardExpiry"
                placeholder="MM/AA"
                autoComplete="cc-exp"
                value={cardExpiry}
                onChange={(event) => setCardExpiry(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardCvv">CVV</Label>
              <Input
                id="cardCvv"
                inputMode="numeric"
                autoComplete="cc-csc"
                value={cardCvv}
                onChange={(event) => setCardCvv(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="installments">Parcelamento</Label>
            <Select value={installments} onValueChange={setInstallments}>
              <SelectTrigger id="installments">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INSTALLMENT_OPTIONS.map((count) => (
                  <SelectItem key={count} value={String(count)}>
                    {count}x de {formatCurrency(totalAmount / count)}
                    {count === 1 ? " (à vista)" : " sem juros"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!canSubmitCard || isSubmitting}
          >
            {isSubmitting ? "Processando..." : `Pagar ${formatCurrency(totalAmount)}`}
          </Button>
        </TabsContent>

        <TabsContent value="pix" className="space-y-4">
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-6 text-center">
            <QrCode className="h-16 w-16 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Escaneie o QR code com o app do seu banco para pagar{" "}
              {formatCurrency(totalAmount)}.
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Confirmando..." : "Já paguei"}
          </Button>
        </TabsContent>

        <TabsContent value="miles" className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Saldo disponível
            </span>
            <span className="font-medium">
              {MOCK_MILES_BALANCE.toLocaleString("pt-BR")} milhas
            </span>
          </div>
          {!canPayWithMiles && (
            <p className="text-sm text-destructive">
              Saldo insuficiente para esta compra (
              {(totalAmount * MOCK_MILES_PER_BRL).toLocaleString("pt-BR")} milhas
              necessárias).
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={!canPayWithMiles || isSubmitting}
          >
            {isSubmitting ? "Confirmando..." : "Pagar com milhas"}
          </Button>
        </TabsContent>
      </Tabs>
    </form>
  )
}

PaymentForm.propTypes = {
  totalAmount: PropTypes.number.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onMethodSelected: PropTypes.func,
}
