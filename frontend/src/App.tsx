import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DashboardComplete from './components/dashboard/DashboardComplete'
import WhoopCallback from './components/auth/WhoopCallback'
import ErrorBoundary from './components/ui/ErrorBoundary'
import { ModalManagerProvider } from './components/shared/ModalManager'

function App() {
  return (
    <ErrorBoundary>
      <ModalManagerProvider>
        <Router>
          <Routes>
            <Route path="/" element={<DashboardComplete />} />
            <Route path="/auth/whoop/callback" element={<WhoopCallback />} />
          </Routes>
        </Router>
      </ModalManagerProvider>
    </ErrorBoundary>
  )
}

export default App