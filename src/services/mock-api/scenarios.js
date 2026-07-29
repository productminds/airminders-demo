/**
 * RF-12: forced failure scenarios, selectable via a debug query param so
 * every failure path is reproducible without touching app state.
 * Usage: append ?mockScenario=empty|timeout|validationFail|paymentDeclined
 * to any URL. Optionally pin the pseudo-random seed with &mockSeed=1234.
 */

export const MOCK_SCENARIOS = /** @type {const} */ ([
  "empty",
  "timeout",
  "validationFail",
  "paymentDeclined",
])

/**
 * @returns {string | null}
 */
export function getForcedScenario() {
  const value = new URLSearchParams(window.location.search).get("mockScenario")
  return MOCK_SCENARIOS.includes(value) ? value : null
}

/**
 * @returns {number | null}
 */
export function getPinnedSeed() {
  const value = new URLSearchParams(window.location.search).get("mockSeed")
  if (value === null) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}
