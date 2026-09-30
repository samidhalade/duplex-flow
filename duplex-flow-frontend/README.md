# DuplexFlow AI - Frontend (Next.js 14)

## Run
    npm install
    npm run dev        # http://localhost:3000

Backend must be running at http://localhost:8000 (change in `.env.local`).

## Backend contract this UI uses
| Endpoint | Used for | Expected shape |
|---|---|---|
| GET /api/token | Start session | `{ token, url, room }` |
| GET /api/benchmark | Benchmark page | `{ pass_rate: { overall, ..., by_domain: {} } }` |
| GET /api/live-logs | Tool calls + transcript panels | `{ calls: [], transcripts: [] }` (strings or objects) |

## Merging
Drop this folder into the backend repo as `frontend/`. Backend CORS already allows http://localhost:3000.
Plain JS and plain CSS (no Tailwind), so there is no extra config to conflict.
