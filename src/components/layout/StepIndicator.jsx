import { Link, useLocation } from "react-router-dom"
import PropTypes from "prop-types"
import { cn } from "@/lib/utils"

const STEPS = [
  { path: "/buscar", label: "Busca" },
  { path: "/selecionar", label: "Voos" },
  { path: "/passageiros", label: "Passageiros" },
  { path: "/revisao", label: "Revisão" },
  { path: "/pagamento", label: "Pagamento" },
  { path: "/confirmacao", label: "Confirmação" },
]

export default function StepIndicator({ onLogoClick }) {
  const { pathname } = useLocation()
  const currentIndex = STEPS.findIndex((step) => step.path === pathname)

  return (
    <header className="border-b pb-4">
      <Link
        to="/"
        onClick={onLogoClick}
        className="text-lg font-bold tracking-tight text-foreground"
      >
        Air<span className="text-primary">Minders</span>
      </Link>

      <ol className="mt-4 flex items-center gap-2 overflow-x-auto sm:gap-3">
        {STEPS.map((step, index) => {
          const isComplete = index < currentIndex
          const isCurrent = index === currentIndex

          return (
            <li key={step.path} className="flex shrink-0 items-center gap-2">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                  isCurrent && "bg-primary text-primary-foreground",
                  isComplete && "bg-secondary text-secondary-foreground",
                  !isCurrent && !isComplete && "bg-muted text-muted-foreground"
                )}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm sm:inline",
                  isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
              {index < STEPS.length - 1 && (
                <span className="h-px w-4 shrink-0 bg-border sm:w-8" aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
    </header>
  )
}

StepIndicator.propTypes = {
  onLogoClick: PropTypes.func,
}
