# AirMinders

Web app that reproduces, end to end, the flow of buying a flight ticket — from
searching flights to payment confirmation. There is no backend: every
business response is simulated by a mock-api layer inside the front end. See
[`../docs/specs.md`](../docs/specs.md) for the full requirements this app
implements.

## Stack

- React 19 + plain JavaScript (no TypeScript — see `../CLAUDE.md` §6)
- Vite
- React Router
- Tailwind CSS + shadcn/ui (Radix primitives, `new-york` style)

## Setup

Requires Node.js 18+ and npm.

```bash
npm install && npm run dev
```

The app runs at `http://localhost:5173`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the Vite dev server |
| `npm run build` | Type-agnostic production build to `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | ESLint (react, react-hooks, jsx-a11y) |
| `npm run format` | Prettier, writes in place |

## Project structure

```
src/
  components/     presentation-only, one concern per screen area
  containers/     state orchestration + mock-api calls per flow step
  hooks/          reusable orchestration logic (useFlightSearch, usePayment, …)
  context/        JourneyContext — the search_id/booking_id/order_id
                  correlation IDs that span the whole flow (specs.md §4.2)
  services/
    mock-api/     simulated business layer: latency, seeded randomness,
                  forced failure scenarios
  lib/            pure helpers (formatting, pricing, validation, ids)
  types/          shared domain shapes, documented via JSDoc @typedef
```

## Exercising failure scenarios

The mock-api layer supports forcing any of the failure paths from RF-12 via
a debug query param, without touching app state:

```
?mockScenario=empty            # search returns zero results
?mockScenario=timeout          # search request times out
?mockScenario=validationFail   # passenger data fails server-side validation
?mockScenario=paymentDeclined  # payment is declined
```

Example: `http://localhost:5173/buscar?mockScenario=timeout`.

Pin the pseudo-random seed for reproducible search results with
`&mockSeed=1234`.
