import React, { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import ErrorPage from './components/error/errorPage'
import AberturaChamado from './pages/Chamado/NewCall'
import ListaChamados from './pages/Chamado/CallList'
import Login from './pages/Auth/Login'
import ChatTI from './pages/Chat'
import HomePage from './pages/Home'
const App = lazy(() => import('./App.jsx'))

function Loader() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f0f0f0',
    }}>
      <div style={{
        border: '8px solid #ddd',
        borderTop: '8px solid #4f46e5',
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        animation: 'spin 1s linear infinite',
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,         // Rota pai que contém o layout e <Outlet />
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Login /> },            // "/"
      { path: 'abrir-chamado', element: <AberturaChamado /> },  // "/abrir-chamado"
      { path: 'lista-chamados', element: <ListaChamados /> },  // "/lista-chamados"
      { path: 'home', element: <HomePage /> },        // "/home"
      { path: 'chat/:uid/:chamadoId', element: <ChatTI /> },   // "/chat/:uid/:chamadoId"
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<Loader />}>
      <RouterProvider router={router} />
    </Suspense>
  </StrictMode>
)
