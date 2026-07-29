import { useEffect } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { AlertTriangle } from "lucide-react"
import SearchForm from "@/components/search/SearchForm"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { useFlightSearch } from "@/hooks/useFlightSearch"

/**
 * RF-01: step 1 of the flow — collects search criteria and hands the
 * result set to the flow layout so step 2 can render it.
 */
export default function SearchContainer() {
  const navigate = useNavigate()
  const { setCriteria, setResults, resetAfterSearch } = useOutletContext()
  const { status, results, error, submitSearch } = useFlightSearch()

  useEffect(() => {
    if (status !== "success" || !results) return
    setResults(results)
    navigate("/selecionar")
  }, [status, results, setResults, navigate])

  function handleSubmit(criteria) {
    resetAfterSearch()
    setCriteria(criteria)
    submitSearch(criteria)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold sm:text-3xl">Para onde vamos?</h1>
        <p className="text-muted-foreground">
          Busque voos por origem, destino, datas e classe da cabine.
        </p>
      </div>

      {status === "error" && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Não foi possível concluir a busca</AlertTitle>
          <AlertDescription>
            {error?.type === "timeout"
              ? "A busca demorou demais para responder. Tente novamente."
              : "Ocorreu um erro inesperado. Tente novamente."}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-4 sm:p-6">
          <SearchForm onSubmit={handleSubmit} isSubmitting={status === "loading"} />
        </CardContent>
      </Card>
    </div>
  )
}
