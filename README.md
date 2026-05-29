# BattleMetrics Player Hours Tracker

Single-page app that searches BattleMetrics players, aggregates session durations across servers, and stores searched/saved players in local browser storage.

## Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Persistence: Browser localStorage

## Project Structure

- `client/`: One-page frontend application
- `server/`: API backend that integrates with BattleMetrics

## Run Locally

1. Install root tooling:
   ```bash
   npm install
   ```
2. Install server dependencies:
   ```bash
   npm install --prefix server
   ```
3. Install client dependencies:
   ```bash
   npm install --prefix client
   ```
4. Optional environment files:
   - Copy `server/.env.example` to `server/.env`
   - Copy `client/.env.example` to `client/.env`
5. Start frontend + backend together:
   ```bash
   npm run dev
   ```

## API

- `GET /api/health`
- `GET /api/players/sessions?query=<playerNameOrId>`

### Notes on BattleMetrics

- Public endpoints are used by default (no token required).
- Some BattleMetrics data can be unavailable or rate-limited depending on account/server visibility.
