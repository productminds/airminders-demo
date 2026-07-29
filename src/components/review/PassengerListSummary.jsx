import PropTypes from "prop-types"
import { Card, CardContent } from "@/components/ui/card"

export default function PassengerListSummary({ passengers }) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <h2 className="text-lg font-semibold">Passageiros</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {passengers.map((passenger, index) => (
            <li key={passenger.passengerId} className="text-foreground">
              {index + 1}. {passenger.firstName} {passenger.lastName}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

PassengerListSummary.propTypes = {
  passengers: PropTypes.arrayOf(
    PropTypes.shape({
      passengerId: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
    })
  ).isRequired,
}
