# Playtime Tracker

A React + Node.js application for looking up player session data.

---

## Project Structure

```
playtime-tracker/
│
├── src/                          ← React frontend
│   ├── App.jsx                   ← Root component (wiring only, no logic)
│   ├── styles/
│   │   └── global.css            ← Design tokens & animations (one source of truth)
│   ├── api/
│   │   └── playerApi.js          ← All HTTP calls (never fetch in components)
│   ├── hooks/
│   │   └── usePlayerSearch.js    ← All state & business logic for the search feature
│   ├── utils/
│   │   ├── formatTime.js         ← Pure helper: seconds → "1h 2m 3s"
│   │   └── validation.js         ← Pure helper: validates player number format
│   └── components/
│       ├── PageHeader/
│       │   └── PageHeader.jsx    ← Title badge and subtitle (no props, no state)
│       ├── SearchPanel/
│       │   └── SearchPanel.jsx   ← Input, progress bar, button, error message
│       ├── PlayerCard/
│       │   ├── PlayerCard.jsx    ← One player's summary row + drawer toggle
│       │   └── SessionDrawer.jsx ← Animated collapsible session list
│       └── PlayerList/
│           └── PlayerList.jsx    ← The full results list + empty state
│
└── server/                       ← Node.js/Express backend
    ├── src/
    │   ├── index.js              ← Starts the HTTP server (entry point)
    │   ├── app.js                ← Express setup: middleware + routes
    │   ├── config.js             ← All environment variables in one place
    │   ├── routes/
    │   │   └── playerRoutes.js   ← URL → controller mapping (no logic)
    │   ├── controllers/
    │   │   └── playerController.js ← Reads req, calls service, writes res
    │   ├── services/
    │   │   ├── playerService.js  ← Business logic (totals, transforms)
    │   │   └── dynamoDBClient.js ← All DynamoDB/AWS SDK calls
    │   └── middleware/
    │       ├── validatePlayerNumber.js ← Rejects bad input before controllers
    │       ├── errorHandler.js   ← Catches all errors (registered last)
    │       └── requestLogger.js  ← Logs method/path/status/duration
    └── tests/
        └── playerService.test.js ← Unit tests (no HTTP, no real DB)
```

---

## Architectural decisions — and why

### Frontend

| Pattern | Why |
|---|---|
| `usePlayerSearch` hook | Components should only render. Logic in hooks is reusable and testable without mounting UI. |
| `playerApi.js` | One place for all `fetch` calls. Swap mock → real API by editing one file. Auth headers go here too. |
| `utils/` folder | Pure functions are the easiest things to test. Zero React dependency. |
| `global.css` variables | All colours/fonts defined once. Changing `--accent` updates everything. Never hard-code a colour in a component. |
| Controlled `SearchPanel` | No state inside. All values come from props. Parent (App) always knows the current input. |

### Backend

| Pattern | Why |
|---|---|
| `routes → controller → service → DB` | Each layer has one job. Routes map URLs. Controllers handle HTTP. Services compute. DB modules talk to AWS. |
| `config.js` | All `process.env` reads in one file. Easy to audit what config the app needs. |
| `errorHandler` middleware | One place for error formatting. Controllers never repeat error-response code. |
| `dynamoDBClient.js` isolated | Swap DynamoDB for PostgreSQL by editing one file. Tests mock this module; no real DB needed. |
| `index.js` vs `app.js` split | Tests import `app` without binding a port. Prevents `EADDRINUSE` errors in test runs. |

---

## Getting started

### Frontend
```bash
npm install
npm run dev        # http://localhost:5173
```

### Backend
```bash
cd server
npm install
cp .env.example .env   # fill in your values
npm run dev        # http://localhost:3001
npm test           # run unit tests
```

### Environment variables
```
PORT=3001
NODE_ENV=development
AWS_REGION=us-east-1
DYNAMODB_TABLE=players
DYNAMODB_ENDPOINT=http://localhost:8000   # local DynamoDB only
FRONTEND_URL=http://localhost:5173
```

---

## Switching from mock to real API

1. Open `src/api/playerApi.js`
2. Delete the `MOCK` block
3. Uncomment the `fetch()` block
4. Set `VITE_API_BASE_URL` in your `.env`

Nothing else changes.
