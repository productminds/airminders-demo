import PropTypes from "prop-types"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"

export default function PriceSummary({ breakdown }) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <h2 className="text-lg font-semibold">Resumo do valor</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tarifa</dt>
            <dd>{formatCurrency(breakdown.fareTotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Taxas e impostos</dt>
            <dd>{formatCurrency(breakdown.taxesTotal)}</dd>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd className="text-primary">{formatCurrency(breakdown.grandTotal)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

PriceSummary.propTypes = {
  breakdown: PropTypes.shape({
    fareTotal: PropTypes.number.isRequired,
    taxesTotal: PropTypes.number.isRequired,
    grandTotal: PropTypes.number.isRequired,
  }).isRequired,
}
