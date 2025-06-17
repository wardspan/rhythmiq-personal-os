import { useState, useEffect } from 'react'

interface SystemHealth {
  api: { status: string; responseTime?: number }
  database: { status: string; responseTime?: number }
  redis: { status: string; responseTime?: number }
  n8n: { status: string; responseTime?: number }
  openweather: { status: string; responseTime?: number }
  openai: { status: string; enabled: boolean }
  anthropic: { status: string; enabled: boolean }
  whoop: { status: string; enabled: boolean }
}

function SystemStatusFooter() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    api: { status: 'checking' },
    database: { status: 'checking' },
    redis: { status: 'checking' },
    n8n: { status: 'checking' },
    openweather: { status: 'checking' },
    openai: { status: 'unknown', enabled: false },
    anthropic: { status: 'unknown', enabled: false },
    whoop: { status: 'unknown', enabled: false }
  })
  const [expanded, setExpanded] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    const checkSystemHealth = async () => {
      const checks = {
        api: checkAPI(),
        database: checkDatabase(),
        redis: checkRedis(),
        n8n: checkN8N(),
        openweather: checkOpenWeather(),
        openai: checkOpenAI(),
        anthropic: checkAnthropic(),
        whoop: checkWhoop()
      }

      const results = await Promise.allSettled([
        checks.api,
        checks.database,
        checks.redis,
        checks.n8n,
        checks.openweather,
        checks.openai,
        checks.anthropic,
        checks.whoop
      ])

      setSystemHealth({
        api: results[0].status === 'fulfilled' ? results[0].value : { status: 'error' },
        database: results[1].status === 'fulfilled' ? results[1].value : { status: 'error' },
        redis: results[2].status === 'fulfilled' ? results[2].value : { status: 'error' },
        n8n: results[3].status === 'fulfilled' ? results[3].value : { status: 'error' },
        openweather: results[4].status === 'fulfilled' ? results[4].value : { status: 'error' },
        openai: results[5].status === 'fulfilled' ? results[5].value : { status: 'unknown', enabled: false },
        anthropic: results[6].status === 'fulfilled' ? results[6].value : { status: 'unknown', enabled: false },
        whoop: results[7].status === 'fulfilled' ? results[7].value : { status: 'unknown', enabled: false }
      })

      setLastUpdated(new Date())
    }

    checkSystemHealth()
    const interval = setInterval(checkSystemHealth, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Individual health check functions
  const checkAPI = async () => {
    const start = Date.now()
    try {
      const response = await fetch('http://localhost:8000/api/v1/health')
      const responseTime = Date.now() - start
      if (response.ok) {
        return { status: 'connected', responseTime }
      }
      return { status: 'error', responseTime }
    } catch {
      return { status: 'error', responseTime: Date.now() - start }
    }
  }

  const checkDatabase = async () => {
    const start = Date.now()
    try {
      const response = await fetch('http://localhost:8000/api/v1/health/database')
      const responseTime = Date.now() - start
      return response.ok ? { status: 'connected', responseTime } : { status: 'error', responseTime }
    } catch {
      return { status: 'error', responseTime: Date.now() - start }
    }
  }

  const checkRedis = async () => {
    const start = Date.now()
    try {
      const response = await fetch('http://localhost:8000/api/v1/health/redis')
      const responseTime = Date.now() - start
      return response.ok ? { status: 'connected', responseTime } : { status: 'error', responseTime }
    } catch {
      return { status: 'error', responseTime: Date.now() - start }
    }
  }

  const checkN8N = async () => {
    const start = Date.now()
    try {
      const response = await fetch('http://localhost:5678/healthz')
      const responseTime = Date.now() - start
      return response.ok ? { status: 'connected', responseTime } : { status: 'error', responseTime }
    } catch {
      return { status: 'disconnected', responseTime: Date.now() - start }
    }
  }

  const checkOpenWeather = async () => {
    const start = Date.now()
    try {
      const response = await fetch('http://localhost:8000/api/v1/weather/current')
      const responseTime = Date.now() - start
      return response.ok ? { status: 'connected', responseTime } : { status: 'error', responseTime }
    } catch {
      return { status: 'error', responseTime: Date.now() - start }
    }
  }

  const checkOpenAI = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/health/openai')
      if (response.ok) {
        const data = await response.json()
        return { status: data.enabled ? 'connected' : 'disabled', enabled: data.enabled }
      }
      return { status: 'unknown', enabled: false }
    } catch {
      return { status: 'unknown', enabled: false }
    }
  }

  const checkAnthropic = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/health/anthropic')
      if (response.ok) {
        const data = await response.json()
        return { status: data.enabled ? 'connected' : 'disabled', enabled: data.enabled }
      }
      return { status: 'unknown', enabled: false }
    } catch {
      return { status: 'unknown', enabled: false }
    }
  }

  const checkWhoop = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/health/whoop')
      if (response.ok) {
        const data = await response.json()
        return { status: data.enabled ? 'connected' : 'disabled', enabled: data.enabled }
      }
      return { status: 'unknown', enabled: false }
    } catch {
      return { status: 'unknown', enabled: false }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '🟢'
      case 'checking': return '🟡'
      case 'error': return '🔴'
      case 'disconnected': return '⚫'
      case 'disabled': return '⚪'
      default: return '❓'
    }
  }

  const coreSystemsHealthy = systemHealth.api.status === 'connected' && 
                           systemHealth.database.status === 'connected'

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        {/* Compact Status Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-700">System Status:</span>
              <span className={`text-sm ${coreSystemsHealthy ? 'text-green-600' : 'text-red-600'}`}>
                {coreSystemsHealthy ? '✓ Operational' : '⚠ Issues Detected'}
              </span>
            </div>
            
            {/* Quick Status Indicators */}
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1">
                <span>{getStatusIcon(systemHealth.api.status)}</span>
                <span className="text-slate-600">API</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>{getStatusIcon(systemHealth.database.status)}</span>
                <span className="text-slate-600">DB</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>{getStatusIcon(systemHealth.openweather.status)}</span>
                <span className="text-slate-600">Weather</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>{getStatusIcon(systemHealth.n8n.status)}</span>
                <span className="text-slate-600">n8n</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-slate-500">
            <span>Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              {expanded ? '▼' : '▶'} Details
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Core Services */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Core Services</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <span>{getStatusIcon(systemHealth.api.status)}</span>
                      <span>Rhythmiq API</span>
                    </span>
                    <span className="text-slate-500">
                      {systemHealth.api.responseTime && `${systemHealth.api.responseTime}ms`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <span>{getStatusIcon(systemHealth.database.status)}</span>
                      <span>PostgreSQL</span>
                    </span>
                    <span className="text-slate-500">
                      {systemHealth.database.responseTime && `${systemHealth.database.responseTime}ms`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <span>{getStatusIcon(systemHealth.redis.status)}</span>
                      <span>Redis Cache</span>
                    </span>
                    <span className="text-slate-500">
                      {systemHealth.redis.responseTime && `${systemHealth.redis.responseTime}ms`}
                    </span>
                  </div>
                </div>
              </div>

              {/* External APIs */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">External APIs</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <span>{getStatusIcon(systemHealth.openweather.status)}</span>
                      <span>OpenWeather</span>
                    </span>
                    <span className="text-slate-500">
                      {systemHealth.openweather.responseTime && `${systemHealth.openweather.responseTime}ms`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <span>{getStatusIcon(systemHealth.openai.status)}</span>
                      <span>OpenAI</span>
                    </span>
                    <span className="text-slate-500">
                      {systemHealth.openai.enabled ? 'Enabled' : 'Not configured'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <span>{getStatusIcon(systemHealth.anthropic.status)}</span>
                      <span>Anthropic</span>
                    </span>
                    <span className="text-slate-500">
                      {systemHealth.anthropic.enabled ? 'Enabled' : 'Not configured'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Automation & Health */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Automation & Health</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <span>{getStatusIcon(systemHealth.n8n.status)}</span>
                      <span>n8n Workflows</span>
                    </span>
                    <span className="text-slate-500">
                      {systemHealth.n8n.responseTime && `${systemHealth.n8n.responseTime}ms`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <span>{getStatusIcon(systemHealth.whoop.status)}</span>
                      <span>WHOOP</span>
                    </span>
                    <span className="text-slate-500">
                      {systemHealth.whoop.enabled ? 'Connected' : 'Not configured'}
                    </span>
                  </div>
                </div>
              </div>

              {/* System Info */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">System Info</h4>
                <div className="space-y-1 text-xs text-slate-500">
                  <div>Frontend: React + Vite</div>
                  <div>Backend: FastAPI + Python</div>
                  <div>Database: PostgreSQL</div>
                  <div>Cache: Redis</div>
                  <div>Automation: n8n</div>
                </div>
              </div>
            </div>

            {/* System Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Rhythmiq Personal OS v1.0.0 • Running in development mode
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => window.open('http://localhost:5678', '_blank')}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Open n8n →
                </button>
                <button className="text-xs text-slate-400 hover:text-slate-600">
                  Refresh Status
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SystemStatusFooter