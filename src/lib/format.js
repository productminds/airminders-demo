const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
})

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  weekday: "short",
})

/**
 * @param {number} value
 * @returns {string}
 */
export function formatCurrency(value) {
  return currencyFormatter.format(value)
}

/**
 * @param {string} isoDateTime
 * @returns {string}
 */
export function formatTime(isoDateTime) {
  return timeFormatter.format(new Date(isoDateTime))
}

/**
 * @param {string} isoDateTime
 * @returns {string}
 */
export function formatDate(isoDateTime) {
  return dateFormatter.format(new Date(isoDateTime))
}

/**
 * @param {number} durationMinutes
 * @returns {string}
 */
export function formatDuration(durationMinutes) {
  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60
  return `${hours}h ${String(minutes).padStart(2, "0")}m`
}

/**
 * @param {number} stops
 * @returns {string}
 */
export function formatStops(stops) {
  return stops === 0 ? "Direto" : `${stops} parada${stops > 1 ? "s" : ""}`
}
