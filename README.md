# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## API configuration

The frontend uses this environment variable:

`VITE_API_URL`
`VITE_API_CREDENTIALS`
`VITE_REQUIRE_AUTH`

Files:

- `.env` (production/default): `VITE_API_URL=https://load-tracker-db.onrender.com`
- `.env.local` (local development): `VITE_API_URL=http://localhost:3000`

Authentication/session note:

By default, the app uses `credentials: "include"` for API calls to support Devise cookie sessions.
Control this with `VITE_API_CREDENTIALS`:

- `VITE_API_CREDENTIALS=true` (default): send cookies on requests.
- `VITE_API_CREDENTIALS=false`: do not send credentials.

Set to `false` if the deployment host blocks/stops cookie-based sessions.

`VITE_REQUIRE_AUTH` controls whether authentication is enforced in the UI.

- `VITE_REQUIRE_AUTH=true`: keep the sign-in flow enabled.
- `VITE_REQUIRE_AUTH=false`: skip the login requirement.

Deployment checklist:

- Confirm `VITE_API_URL` in deployment environment points to the live Rails API.
- Ensure the API allows the front-end origin in CORS (`*` or explicit domain, plus credentials/cookies if needed).
- If you see blank Services/Loads only in deploy, check `VITE_API_CREDENTIALS`:
  - keep `true` for cookie sessions,
  - set `false` only when cookies are being stripped before API requests.
- Verify session endpoints (`/users/sign_in.json`, `/me`, `/loads`) return JSON and expected status codes.
- If `/loads` renders no rows, open browser network response for `/loads` and compare payload shape to app expectations.

Run `npm run dev` for local work, and Vite will automatically load `.env.local` first, then `.env`.
