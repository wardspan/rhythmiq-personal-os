import React, { useState, useEffect } from 'react'

interface SystemStatusModalProps {
  modalManager?: any
}

interface SystemMetric {
  name: string
  status: 'healthy' | 'warning' | 'error'
  value: string
  description: string
  icon: string
}

export default function SystemStatusModal({ modalManager }: SystemStatusModalProps) {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    {
      name: 'Backend API',
      status: 'healthy',
      value: '200ms',
      description: 'API response time',
      icon: '🔌'
    },
    {
      name: 'Database',
      status: 'healthy',
      value: 'Connected',
      description: 'PostgreSQL connection',
      icon: '🗄️'
    },
    {
      name: 'WHOOP Integration',
      status: 'warning',
      value: 'OAuth Pending',
      description: 'Fitness data sync',
      icon: '💪'
    },
    {
      name: 'AI Services',
      status: 'healthy',
      value: 'Online',
      description: 'AI assistant and automation',
      icon: '🤖'
    },
    {
      name: 'Chaos Detection',
      status: 'healthy',
      value: 'Active',
      description: 'Productivity monitoring',
      icon: '🌪️'
    },
    {
      name: 'Weather API',
      status: 'healthy',
      value: 'Synced',
      description: 'Weather data updates',
      icon: '🌤️'
    }
  ])

  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.name === 'Backend API' 
          ? `${Math.floor(Math.random() * 100 + 150)}ms`
          : metric.value
      })))
      setLastUpdate(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: SystemMetric['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200'
    }
  }

  const getStatusIcon = (status: SystemMetric['status']) => {
    switch (status) {
      case 'healthy':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return '⚪'
    }
  }

  const healthyCount = metrics.filter(m => m.status === 'healthy').length
  const warningCount = metrics.filter(m => m.status === 'warning').length
  const errorCount = metrics.filter(m => m.status === 'error').length

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-2">⚡ System Status</h2>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-slate-600">{healthyCount} Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-slate-600">{warningCount} Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-slate-600">{errorCount} Error</span>
          </div>
        </div>
        <div className="text-xs text-slate-500 mt-2">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{metric.icon}</span>
                <div>
                  <h3 className="font-medium text-slate-800">{metric.name}</h3>
                  <p className="text-xs text-slate-500">{metric.description}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(metric.status)}`}>
                {getStatusIcon(metric.status)} {metric.status}
              </div>
            </div>
            
            <div className="text-lg font-semibold text-slate-700">
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <h3 className="font-medium text-slate-800 mb-3">Quick Actions</h3>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setLastUpdate(new Date())}
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm transition-colors"
          >
            🔄 Refresh Status
          </button>
          <button
            onClick={() => {/* Open logs modal */}}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm transition-colors"
          >
            📋 View Logs
          </button>
          <button
            onClick={() => {/* Open diagnostics */}}
            className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm transition-colors"
          >
            🔧 Run Diagnostics
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
        <div className="text-xs text-slate-600 space-y-1">
          <div>Version: Rhythmiq Personal OS v1.0.0</div>
          <div>Environment: Development</div>
          <div>Uptime: {Math.floor(Date.now() / 1000 / 60)} minutes</div>
        </div>
      </div>
    </div>
  )
}