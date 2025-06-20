import React from 'react'
import WeatherWidget from './WeatherWidget'
import HealthWidget from './HealthWidget'
import TaskWidget from './TaskWidget'
import WhoopRecoveryWidget from './WhoopRecoveryWidget'
import WhoopSleepWidget from './WhoopSleepWidget'
import WhoopInsightsWidget from './WhoopInsightsWidget'
import SystemStatusFooter from './SystemStatusFooter'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Rhythmiq Personal OS
          </h1>
          <p className="text-slate-600">
            Your personalized productivity dashboard with health-optimized insights
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Core Widgets */}
          <div className="lg:col-span-2 space-y-6">
            {/* Top Row - Health and Tasks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HealthWidget />
              <TaskWidget />
            </div>
            
            {/* Weather with Health Integration */}
            <WeatherWidget />
            
            {/* WHOOP Detailed Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WhoopRecoveryWidget />
              <WhoopSleepWidget />
            </div>
          </div>

          {/* Right Column - Insights and Analysis */}
          <div className="space-y-6">
            <WhoopInsightsWidget />
            
            {/* Placeholder for other widgets */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-medium text-slate-800 mb-4">Chaos Indicator</h3>
              <div className="text-center text-slate-500">
                <div className="text-2xl mb-2">🧘</div>
                <div className="text-sm">Coming soon</div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-medium text-slate-800 mb-4">MIT Tracker</h3>
              <div className="text-center text-slate-500">
                <div className="text-2xl mb-2">⭐</div>
                <div className="text-sm">Coming soon</div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status Footer */}
        <SystemStatusFooter />

        {/* Integration Info */}
        <div className="mt-6 text-center">
          <div className="text-xs text-slate-400">
            Health data integration enables personalized productivity optimization
          </div>
        </div>
      </div>
    </div>
  )
}