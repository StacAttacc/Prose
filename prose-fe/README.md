# prose-fe

React + Vite frontend for [Prose](../README.md).

See the [root README](../README.md) for project overview, setup, and
deployment instructions. This package follows the standard Vite layout.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server on `:5173` |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run Vitest in watch mode |
| `npm run test:ui` | Run Vitest with the browser UI |
| `npm run lint` | Run ESLint over the project |

## Environment

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to point at the
backend. Defaults to `http://localhost:8080`.
