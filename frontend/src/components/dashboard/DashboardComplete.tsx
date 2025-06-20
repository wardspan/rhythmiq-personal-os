import React from 'react'
import ChaosIndicator from './ChaosIndicator'
import WeatherWidget from './WeatherWidget'
import HealthWidgetFixed from './HealthWidgetFixed'
import MITWidget from './MITWidget'
import TaskWidget from './TaskWidget'
import ActionButtons from './ActionButtons'
import SystemStatusFooter from './SystemStatusFooter'
import { ModalLauncherComponent, useModalControls } from '../shared/ModalManager'

export default function DashboardComplete() {
  const modalControls = useModalControls()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header with Modal Launcher */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Rhythmiq Personal OS
            </h1>
            <p className="text-slate-600">
              Your personalized productivity dashboard with health-optimized insights
            </p>
          </div>
          
          {/* Modal Launcher */}
          <div className="flex items-center gap-3">
            <ModalLauncherComponent />
            
            {/* Quick Launch Buttons */}
            <div className="flex gap-2">
              <button
                onClick={modalControls.openTaskManager}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm"
                title="Open Task Manager"
              >
                📋
              </button>
              <button
                onClick={modalControls.openAIAssistant}
                className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors text-sm"
                title="Open AI Assistant"
              >
                🤖
              </button>
              <button
                onClick={modalControls.openSystemStatus}
                className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors text-sm"
                title="Open System Status"
              >
                ⚡
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          
          {/* Left Column - Primary Widgets */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Top Row - Chaos and Weather */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChaosIndicator />
              <WeatherWidget />
            </div>
            
            {/* Middle Row - Health and MITs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HealthWidgetFixed />
              <MITWidget />
            </div>

            {/* Action Buttons Row */}
            <ActionButtons />
            
          </div>

          {/* Right Column - Task Management */}
          <div className="lg:col-span-4 space-y-6">
            <TaskWidget />
            
            {/* Additional Status Cards */}
            <div className="space-y-4">

              {/* AI Assistant Quick Access */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-medium text-slate-800 mb-4">AI Assistant</h3>
                <div className="text-center space-y-3">
                  <div className="text-3xl">🤖</div>
                  <div className="text-sm text-slate-600">
                    Get intelligent task recommendations and productivity insights
                  </div>
                  <button 
                    onClick={() => window.open('http://localhost:5678/workflow/ai-chat', '_blank')}
                    className="w-full px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Start AI Chat
                  </button>
                </div>
              </div>

              {/* Productivity Insights */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-medium text-slate-800 mb-4">Today's Insights</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2"></div>
                    <div className="text-slate-600">
                      Your energy levels are optimal for complex tasks
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                    <div className="text-slate-600">
                      Weather conditions support outdoor activities
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2"></div>
                    <div className="text-slate-600">
                      Moderate chaos detected - prioritize important tasks
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* System Status Footer */}
        <SystemStatusFooter />

      </div>
    </div>
  )
}