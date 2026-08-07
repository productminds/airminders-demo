import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"
import { initAnalytics } from "./services/analytics"

// Ampli must be loaded exactly once at application startup, before the
// first render can fire any tracking call. The SDK instance is a module
// singleton, so it survives all SPA route changes.
initAnalytics()

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
)
