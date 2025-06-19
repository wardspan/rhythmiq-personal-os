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
    let isMounted = true

    const checkSystemHealth = async () => {
      try {
        const checks = [
          checkAPI(),
          checkDatabase(),
          checkRedis(),
          checkN8N(),
          checkOpenWeather(),
          checkOpenAI(),
          checkAnthropic(),
          checkWhoop()
        ]

        const results = await Promise.allSettled(checks)

        if (!isMounted) return

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
      } catch (error) {
        console.error('System health check failed:', error)
        if (isMounted) {
          setSystemHealth({
            api: { status: 'error' },
            database: { status: 'error' },
            redis: { status: 'error' },
            n8n: { status: 'error' },
            openweather: { status: 'error' },
            openai: { status: 'unknown', enabled: false },
            anthropic: { status: 'unknown', enabled: false },
            whoop: { status: 'unknown', enabled: false }
          })
        }
      }
    }

    checkSystemHealth()
    const interval = setInterval(checkSystemHealth, 30000) // Check every 30 seconds

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  // Individual health check functions
  const checkAPI = async () => {
    const start = Date.now()
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/health', {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      const responseTime = Date.now() - start
      if (response.ok) {
        return { status: 'connected', responseTime }
      }
      return { status: 'error', responseTime }
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        return { status: 'timeout', responseTime: 5000 }
      }
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
                <span>{getStatusIcon(systemHealth.whoop.status)}</span>
                <span className="text-slate-600">WHOOP</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>{getStatusIcon(systemHealth.n8n.status)}</span>
                <span className="text-slate-600">n8n</span>
              </span>
              <div className="w-px h-4 bg-slate-200"></div>
              <span className="flex items-center space-x-1">
                <span>🤖</span>
                <span className="text-slate-600">AI Ready</span>
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

            {/* System Actions & Quick Access */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-slate-500">
                  Rhythmiq Personal OS v1.0.0 • Running in development mode
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Refresh Status
                </button>
              </div>
              
              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button 
                  onClick={() => window.open('http://localhost:5678', '_blank')}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-xs"
                >
                  <span>🔧</span>
                  <span>Open n8n Console</span>
                </button>
                
                <button 
                  onClick={() => window.open('http://localhost:5678/workflow/ai-chat', '_blank')}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors text-xs"
                >
                  <span>🤖</span>
                  <span>Start AI Chat</span>
                </button>
                
                <div className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-xs">
                  <span>💚</span>
                  <span>Health Integration {systemHealth.whoop.enabled ? 'Active' : 'Ready'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SystemStatusFooter