/**
 * @param {string} prefix
 * @returns {string}
 */
export function generateId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`
}
