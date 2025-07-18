# Frontbase Frontend

This is the frontend for the Frontbase platform, built with React, Vite, Zustand, React Router, and Tailwind CSS. It provides a modern dashboard for managing repositories, deployments, and environment variables, and integrates with a backend for authentication and deployment automation.

## Features

- **Authentication**: Secure login and session management using JWT cookies and Zustand store.
- **Repository Management**: View, set up, and deploy GitHub repositories with workflow automation.
- **Deployment Status**: Real-time polling and UI feedback for deployment progress and results.
- **Environment Variables**: Set and manage environment variables for each repo before deployment.
- **Responsive UI**: Built with Tailwind CSS and a rich set of atomic UI components.
- **Protected Routes**: Only authenticated users can access the dashboard and deployment features.
- **Dark/Light Theme**: Theme toggling with persistent user preference.

## Project Structure

```
frontend/
  src/
    assets/           # Static assets (icons, images, etc.)
    components/       # Reusable UI and layout components
      ui/             # Atomic UI components (Button, Dialog, Table, etc.)
    hooks/            # Custom React hooks
    lib/              # Utility libraries
    pages/            # Main app pages (Dashboard, Deployments, Login, etc.)
    store/            # Zustand stores for state management
    App.jsx           # Main app component with routing
    main.jsx          # Entry point, sets up providers
    index.css         # Global styles (Tailwind)
```

## Main Pages

- **Home**: Landing page with app introduction.
- **Login**: User authentication page.
- **Dashboard**: Main user dashboard for managing repositories and deployments.
- **DeploymentsPage**: List of all deployments across repositories.
- **DeploymentDetails**: Detailed view for a specific deployment.
- **Callback**: OAuth callback handler.

## Key Components

- **EnvDialog**: Modal for setting environment variables and build settings before deployment.
- **Header, Sidebar, Layout**: App layout and navigation.
- **UI Components**: Button, Dialog, Table, Badge, Skeleton, etc. (in `components/ui/`).

## State Management

- **Zustand** is used for authentication state (`src/store/auth.js`).
- **React Query** is set up for future data fetching/caching needs.

## Routing

- Uses **React Router v7** for client-side routing (see `App.jsx`).
- Protected routes ensure only authenticated users can access sensitive pages.

## Deployment & Polling Logic

- When a user deploys a repo, the frontend triggers the backend and polls `/api/github/repos/:repo_id/deployment-status` for real-time status.
- On success, the user is redirected to the deployment details page.
- The Deploy button shows a loading spinner while deployment is in progress.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Setup

1. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```
2. Create a `.env` file in the `frontend/` directory with:

   ```env
   VITE_BACKEND_URL=http://localhost:3000
   ```

   (Set this to your backend URL as appropriate.)

3. Start the development server:

   ```sh
   npm run dev
   # or
   yarn dev
   ```

4. Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

### Build for Production

```sh
npm run build
# or
yarn build
```

### Linting

```sh
npm run lint
# or
yarn lint
```

## Customization

- UI components are easily customizable via Tailwind and the `components/ui/` directory.
- Add new pages in `src/pages/` and update `App.jsx` for routing.

## Contributing

Pull requests and issues are welcome! Please follow the existing code style and structure.

## License

MIT
