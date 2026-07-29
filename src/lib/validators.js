const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * @param {import("../types/domain").Passenger} passenger
 * @returns {{ fieldName: string, errorType: "required"|"invalid_format" }[]}
 */
export function validatePassenger(passenger) {
  const errors = []

  const requiredFields = [
    "firstName",
    "lastName",
    "birthDate",
    "documentNumber",
    "email",
    "phone",
  ]
  for (const fieldName of requiredFields) {
    if (!passenger[fieldName]?.trim()) {
      errors.push({ fieldName, errorType: "required" })
    }
  }

  if (passenger.email && !EMAIL_PATTERN.test(passenger.email)) {
    errors.push({ fieldName: "email", errorType: "invalid_format" })
  }

  if (passenger.birthDate && Number.isNaN(Date.parse(passenger.birthDate))) {
    errors.push({ fieldName: "birthDate", errorType: "invalid_format" })
  }

  return errors
}
