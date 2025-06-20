import React from 'react'
import WeatherWidget from './WeatherWidget'
import HealthWidgetFixed from './HealthWidgetFixed'
import SystemStatusFooter from './SystemStatusFooter'

export default function DashboardSimple() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Rhythmiq Personal OS
          </h1>
          <p className="text-slate-600">
            Your personalized productivity dashboard
          </p>
        </div>

        {/* Simple Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weather Widget - Known Working */}
          <WeatherWidget />
          
          {/* Health Widget Fixed */}
          <HealthWidgetFixed />
        </div>

        {/* Additional Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Status Widget */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-medium text-slate-800 mb-4">System Status</h3>
            <div className="text-center">
              <div className="text-2xl mb-2">✅</div>
              <div className="text-sm text-slate-600">All systems operational</div>
            </div>
          </div>

          {/* WHOOP Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-medium text-slate-800 mb-4">WHOOP Integration</h3>
            <div className="text-center">
              <div className="text-2xl mb-2">🔗</div>
              <div className="text-sm text-green-600">Configured & Ready</div>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Task Intelligence</h3>
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm text-slate-500">Coming soon</div>
            </div>
          </div>
        </div>

        {/* System Status Footer */}
        <SystemStatusFooter />
      </div>
    </div>
  )
}