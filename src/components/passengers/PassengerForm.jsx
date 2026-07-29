import PropTypes from "prop-types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const FIELD_ERROR_MESSAGES = {
  required: "Campo obrigatório.",
  invalid_format: "Formato inválido.",
}

/**
 * RF-07: pure presentational form for a single passenger's data. Errors
 * are passed in rather than computed here so both client-side and
 * mock-api (server-style) validation can drive the same UI.
 */
export default function PassengerForm({ index, passenger, errors, onChange }) {
  function updateField(field, value) {
    onChange({ ...passenger, [field]: value })
  }

  function errorFor(field) {
    const fieldError = errors.find((error) => error.fieldName === field)
    return fieldError ? FIELD_ERROR_MESSAGES[fieldError.errorType] : null
  }

  const idPrefix = `passenger-${index}`

  return (
    <fieldset className="space-y-4 rounded-lg border bg-card p-4 sm:p-6">
      <legend className="px-1 text-base font-medium">Passageiro {index + 1}</legend>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-firstName`}>Nome</Label>
          <Input
            id={`${idPrefix}-firstName`}
            value={passenger.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
            aria-invalid={Boolean(errorFor("firstName"))}
          />
          {errorFor("firstName") && (
            <p className="text-sm text-destructive">{errorFor("firstName")}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-lastName`}>Sobrenome</Label>
          <Input
            id={`${idPrefix}-lastName`}
            value={passenger.lastName}
            onChange={(event) => updateField("lastName", event.target.value)}
            aria-invalid={Boolean(errorFor("lastName"))}
          />
          {errorFor("lastName") && (
            <p className="text-sm text-destructive">{errorFor("lastName")}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-birthDate`}>Data de nascimento</Label>
          <Input
            id={`${idPrefix}-birthDate`}
            type="date"
            value={passenger.birthDate}
            onChange={(event) => updateField("birthDate", event.target.value)}
            aria-invalid={Boolean(errorFor("birthDate"))}
          />
          {errorFor("birthDate") && (
            <p className="text-sm text-destructive">{errorFor("birthDate")}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-documentNumber`}>Documento (CPF/Passaporte)</Label>
          <Input
            id={`${idPrefix}-documentNumber`}
            value={passenger.documentNumber}
            onChange={(event) => updateField("documentNumber", event.target.value)}
            aria-invalid={Boolean(errorFor("documentNumber"))}
          />
          {errorFor("documentNumber") && (
            <p className="text-sm text-destructive">{errorFor("documentNumber")}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-email`}>E-mail</Label>
          <Input
            id={`${idPrefix}-email`}
            type="email"
            value={passenger.email}
            onChange={(event) => updateField("email", event.target.value)}
            aria-invalid={Boolean(errorFor("email"))}
          />
          {errorFor("email") && (
            <p className="text-sm text-destructive">{errorFor("email")}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-phone`}>Telefone</Label>
          <Input
            id={`${idPrefix}-phone`}
            type="tel"
            value={passenger.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            aria-invalid={Boolean(errorFor("phone"))}
          />
          {errorFor("phone") && (
            <p className="text-sm text-destructive">{errorFor("phone")}</p>
          )}
        </div>
      </div>
    </fieldset>
  )
}

PassengerForm.propTypes = {
  index: PropTypes.number.isRequired,
  passenger: PropTypes.shape({
    passengerId: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    birthDate: PropTypes.string.isRequired,
    documentNumber: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
  }).isRequired,
  errors: PropTypes.arrayOf(
    PropTypes.shape({
      fieldName: PropTypes.string.isRequired,
      errorType: PropTypes.string.isRequired,
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
}
