import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DashboardComplete from './components/dashboard/DashboardComplete'
import WhoopCallback from './components/auth/WhoopCallback'
import ErrorBoundary from './components/ui/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<DashboardComplete />} />
          <Route path="/auth/whoop/callback" element={<WhoopCallback />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}

export default App