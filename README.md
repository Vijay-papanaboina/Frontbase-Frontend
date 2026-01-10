# Frontbase Frontend

**Frontbase** is a platform for deploying static frontend projects to the edge. Connect your GitHub, select a repository, configure your build settings, and deploy to Cloudflare's global network with a unique subdomain.

**This repo** contains the React dashboard where users manage their deployments.

- Backend repo: [Frontbase-Backend](https://github.com/Vijay-papanaboina/Frontbase-Backend.git)
- Cloudflare Worker repo: [frontbase_cloudflare_worker](https://github.com/Vijay-papanaboina/frontbase_cloudflare_worker)

## Features

- GitHub login via OAuth
- Repository list with deployment status
- One-click workflow setup (injects GitHub Action)
- Environment variable configuration per repo
- Deployment status polling and details
- Responsive UI with dark theme

## Architecture

```mermaid
flowchart TB
    subgraph Frontend["Frontend (React + Vite)"]
        UI[Dashboard UI]
        Auth[Auth Store]
        Hooks[Custom Hooks]
    end

    subgraph Backend["Backend (Express)"]
        Routes[API Routes]
        Controllers[Controllers]
        Services[Services]
        Repos[Repositories]
        DB[(PostgreSQL)]
    end

    subgraph External
        GitHub[GitHub API]
        R2[Cloudflare R2]
        KV[Cloudflare KV]
        Worker[CF Worker]
    end

    UI --> Routes
    Routes --> Controllers --> Services --> Repos --> DB
    Services --> GitHub
    Services --> R2
    Services --> KV
    Worker --> KV
    Worker --> R2
```

### Deployment Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant GitHub
    participant R2
    participant KV
    participant Worker

    User->>Frontend: Click Login
    Frontend->>Backend: GET /api/auth/github
    Backend-->>User: Redirect to GitHub OAuth
    User->>GitHub: Authorize app
    GitHub-->>Frontend: Redirect to /callback?code=xxx
    Frontend->>Backend: GET /api/auth/github/callback?code=xxx
    Backend->>GitHub: Exchange code for token
    Backend-->>Frontend: Set JWT cookie
    Frontend->>Frontend: Redirect to /dashboard

    Frontend->>Backend: GET /api/github/repositories
    Backend->>GitHub: Fetch user repos
    Backend-->>Frontend: Return repos list

    User->>Frontend: Click "Setup Workflow"
    Frontend->>Backend: POST /api/github/workflows/:id/setup
    Backend->>GitHub: Inject secret (ENV_ACCESS_TOKEN)
    Backend->>GitHub: Create deploy.yml workflow
    Backend->>GitHub: Trigger workflow dispatch

    GitHub->>GitHub: Run build workflow
    GitHub->>Backend: POST /api/upload/:id (zip)
    Backend->>R2: Upload extracted files
    Backend->>KV: Set subdomain → folder mapping

    User->>Worker: Visit subdomain.frontbase.space
    Worker->>KV: Lookup mapping
    Worker->>R2: Fetch files
    Worker-->>User: Serve site
```

### Directory Structure

```
frontend/
  src/
    components/
      EnvDialog.jsx        # Environment variables modal
      RepoCard.jsx         # Mobile repo card
      RepoTable.jsx        # Desktop repo table
      RepoStatus.jsx       # Deployment status badge
      Header.jsx, Sidebar.jsx, Layout.jsx
      ui/                  # Shadcn atomic UI components
    pages/
      Dashboard.jsx        # Main repo list & workflow setup
      DeploymentsPage.jsx  # All deployments
      DeploymentDetails.jsx
      Login.jsx
      callback.jsx         # OAuth callback handler
      ProtectedRoute.jsx   # Auth guard
    store/
      auth.js              # Zustand auth state
    hooks/
      useRepos.js          # Repository fetching hook
      useDeployments.js    # Deployment polling hook
      use-mobile.js        # Mobile detection
    config/
      frameworks.js        # Build framework definitions
    lib/
      utils.js             # Utility functions
    App.jsx                # Route definitions
    main.jsx               # React entry point
  vite.config.js
  vercel.json              # SPA rewrites
```

## Quick Start (Full Stack)

### Prerequisites

- Node.js 18+
- PostgreSQL database
- GitHub OAuth App (create at https://github.com/settings/developers)
- Cloudflare account with R2 bucket and KV namespace

### 1. Clone Both Repos

```bash
mkdir frontbase
cd frontbase
git clone https://github.com/Vijay-papanaboina/Frontbase-Backend.git backend
git clone https://github.com/Vijay-papanaboina/Frontbase-Frontend.git frontend
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials (see backend README)
npx drizzle-kit push
npm run dev
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
echo "VITE_BACKEND_URL=http://localhost:3000" > .env
npm run dev
```

### 4. Configure GitHub OAuth

In your GitHub OAuth App settings:

- **Homepage URL**: `http://localhost:5173`
- **Callback URL**: `http://localhost:5173/callback`

## Environment Variables

| Variable           | Description          | Example                 |
| ------------------ | -------------------- | ----------------------- |
| `VITE_BACKEND_URL` | Backend API base URL | `http://localhost:3000` |

## Deployment (Vercel)

1. Add environment variable: `VITE_BACKEND_URL`
2. Ensure backend CORS allows the deployed frontend origin
3. `vercel.json` includes SPA rewrite (all paths → `/`)

## Troubleshooting

| Issue                  | Solution                                                |
| ---------------------- | ------------------------------------------------------- |
| CORS / 401 errors      | Check `VITE_BACKEND_URL` and backend CORS allowlist     |
| Cookies not sent       | Ensure `credentials: "include"` and HTTPS in production |
| Blank route on refresh | Verify `vercel.json` is deployed                        |

## Cross-Links

- **Backend**: https://github.com/Vijay-papanaboina/Frontbase-Backend.git
- **Cloudflare Worker**: https://github.com/Vijay-papanaboina/frontbase_cloudflare_worker

## License

MIT
