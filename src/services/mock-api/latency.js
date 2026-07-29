import { randomInt } from "./random"

const MIN_LATENCY_MS = 300
const MAX_LATENCY_MS = 1200

/**
 * RF-13: artificial latency (300-1200ms) so loading states are demonstrable.
 * @param {() => number} rng
 * @returns {Promise<void>}
 */
export function simulateLatency(rng) {
  const delayMs = randomInt(rng, MIN_LATENCY_MS, MAX_LATENCY_MS)
  return new Promise((resolve) => setTimeout(resolve, delayMs))
}
