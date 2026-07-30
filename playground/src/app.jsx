import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import { ROUTES } from './constants'
import AllPluginsPage from './pages/all-plugins'
import GfmPage from './pages/gfm'
import GithubAlertsPage from './pages/github-alerts'
import HighlightPage from './pages/highlight'
import HomePage from './pages/index'
import MathPage from './pages/math'
import MermaidPage from './pages/mermaid'

function AppShell() {
  return <Outlet />
}

const exampleRouteElements = {
  'all-plugins': <AllPluginsPage />,
  'github-alerts': <GithubAlertsPage />,
  gfm: <GfmPage />,
  highlight: <HighlightPage />,
  math: <MathPage />,
  mermaid: <MermaidPage />,
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      ...ROUTES.map(route => ({
        path: route.path,
        element: exampleRouteElements[route.id],
      })),
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
