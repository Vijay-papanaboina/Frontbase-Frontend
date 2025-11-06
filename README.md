# Frontbase Frontend

React + Vite app for managing repositories, deployments, and environment variables with GitHub OAuth via the backend.

- Backend repo: [Frontbase-Backend](https://github.com/Vijay-papanaboina/Frontbase-Backend.git)
- Cloudflare Worker repo: [frontbase_cloudflare_worker](https://github.com/Vijay-papanaboina/frontbase_cloudflare_worker)
- Live repo reference: [Frontbase-Frontend](https://github.com/Vijay-papanaboina/Frontbase-Frontend.git)

## Features

- GitHub login via backend; cookie-based session
- Repository list, workflows setup, deploy/redeploy
- Set env vars per repo prior to deployment
- Deployment status polling and details
- Protected routes and responsive UI
- Theme support

## Architecture

- Vite + React + Tailwind + Zustand + React Router
- API calls use `fetch` with `credentials: "include"`
- SPA routing; Vercel rewrite for all routes to `/`

### Directory Structure

```
frontend/
  src/
    components/
      EnvDialog.jsx
      EnvVarsDialog.jsx
      RedeployDialog.jsx
      Header.jsx, Sidebar.jsx, Layout.jsx
      ui/                 # atomic UI components
    pages/
      Dashboard.jsx
      DeploymentsPage.jsx
      DeploymentDetails.jsx
      Login.jsx
      callback.jsx
      ProtectedRoute.jsx
    store/
      auth.js            # session check/logout
    hooks/
    lib/
    App.jsx
    main.jsx
  vite.config.js
  vercel.json            # SPA rewrites
```

## Environment Variables

Create `.env` in `frontend/`:

- VITE_BACKEND_URL: backend base URL (e.g., http://localhost:3000)

Used in:

- API endpoints across pages/components
- Auth store (`/api/auth/me`, `/api/auth/logout`)

## Local Setup

1. Node.js 18+
2. Install dependencies:
   - npm install
3. Create `frontend/.env` with:
   - VITE_BACKEND_URL=http://localhost:3000
4. Start dev server:
   - npm run dev
   - App at http://localhost:5173

## Deployment (Vercel)

- Add environment variable:
  - VITE_BACKEND_URL: https://your-backend.example.com
- Ensure backend CORS allows the deployed frontend origin.
- `vercel.json` includes a rewrite to support SPA routes:
  - All paths → `/`

Cookies

- Backend sets secure cookies in production; deploy frontend over HTTPS.

## Troubleshooting

- CORS / 401:
  - Ensure VITE_BACKEND_URL points to correct backend URL.
  - Backend allowlist includes your deployed frontend origin.
- Cookies not sent:
  - Requests must use `credentials: "include"` (already implemented).
  - In dev, use matching hostnames and avoid mixed HTTP/HTTPS.
- Blank route on refresh:
  - Vercel rewrite present; verify `vercel.json` is deployed.
- Build errors:
  - Confirm Vite env prefix `VITE_` and variable name matches.

## Cross-Links

- Backend: https://github.com/Vijay-papanaboina/Frontbase-Backend.git
- Cloudflare Worker: https://github.com/Vijay-papanaboina/frontbase_cloudflare_worker

## License

MIT
