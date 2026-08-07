import { useEffect, useRef } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { AlertTriangle } from "lucide-react"
import SearchForm from "@/components/search/SearchForm"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { useFlightSearch } from "@/hooks/useFlightSearch"
import { trackFlightSearchStarted } from "@/services/analytics"

/**
 * RF-01: step 1 of the flow — collects search criteria and hands the
 * result set to the flow layout so step 2 can render it.
 */
export default function SearchContainer() {
  const navigate = useNavigate()
  const { criteria, setCriteria, setResults, resetAfterSearch } = useOutletContext()
  const { status, results, error, submitSearch } = useFlightSearch()
  const hasStartedSearch = useRef(false)

  useEffect(() => {
    if (status !== "success" || !results) return
    setResults(results)
    navigate("/selecionar")
  }, [status, results, setResults, navigate])

  function handleSubmit(nextCriteria) {
    resetAfterSearch()
    setCriteria(nextCriteria)
    submitSearch(nextCriteria)
  }

  // Flight Search Started: first interaction with the form this visit. A
  // visit with criteria already in flow state is a post-results edit.
  function handleFormInteraction() {
    if (hasStartedSearch.current) return
    hasStartedSearch.current = true
    trackFlightSearchStarted({ entryPoint: criteria ? "results_edit" : "home" })
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

      <Card onFocusCapture={handleFormInteraction}>
        <CardContent className="p-4 sm:p-6">
          <SearchForm onSubmit={handleSubmit} isSubmitting={status === "loading"} />
        </CardContent>
      </Card>
    </div>
  )
}
