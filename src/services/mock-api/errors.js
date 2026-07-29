/**
 * @typedef {"timeout"|"validation_failed"|"payment_declined"} MockApiErrorType
 */

export class MockApiError extends Error {
  /**
   * @param {string} message
   * @param {MockApiErrorType} type
   */
  constructor(message, type) {
    super(message)
    this.name = "MockApiError"
    this.type = type
  }
}
