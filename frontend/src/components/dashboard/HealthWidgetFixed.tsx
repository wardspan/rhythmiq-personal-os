import React, { useState, useEffect } from 'react'

interface WhoopHealthData {
  whoop_connected: boolean
  recovery_score?: number
  sleep_quality?: number
  hrv_score?: number
  resting_heart_rate?: number
  sleep_duration?: number
  sleep_efficiency?: number
  last_updated?: string
}

interface WhoopStatus {
  connected: boolean
  enabled: boolean
  profile?: {
    name?: string
    email?: string
  }
}

export default function HealthWidgetFixed() {
  const [health, setHealth] = useState<WhoopHealthData | null>(null)
  const [status, setStatus] = useState<WhoopStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    let isMounted = true
    
    const fetchData = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout
        
        // Fetch health data
        const healthResponse = await fetch('http://localhost:8000/api/v1/whoop/health', {
          signal: controller.signal
        })
        const healthData = await healthResponse.json()
        
        // Fetch status
        const statusResponse = await fetch('http://localhost:8000/api/v1/whoop/status', {
          signal: controller.signal
        })
        const statusData = await statusResponse.json()
        
        clearTimeout(timeoutId)
        
        if (isMounted) {
          setHealth(healthData)
          setStatus(statusData)
        }
      } catch (error) {
        console.error('Error fetching WHOOP data:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const response = await fetch('http://localhost:8000/api/v1/whoop/connect')
      const data = await response.json()
      if (data.auth_url) {
        window.location.href = data.auth_url
      }
    } catch (error) {
      console.error('Error connecting to WHOOP:', error)
      setConnecting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-slate-200 rounded mb-4"></div>
          <div className="h-16 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Show connection screen if not connected
  if (!status?.connected) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="text-center">
          <div className="text-3xl mb-3">💓</div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">Connect WHOOP</h3>
          <p className="text-sm text-slate-500 mb-4">
            {status?.enabled 
              ? "Connect your WHOOP device to track recovery, sleep, and strain data."
              : "WHOOP integration is not configured on this server."
            }
          </p>
          
          {status?.enabled && (
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {connecting ? 'Connecting...' : 'Connect WHOOP'}
            </button>
          )}
          
          <div className="mt-4 text-xs text-slate-400">
            <div className="mb-2">Benefits of connecting WHOOP:</div>
            <ul className="text-left space-y-1 max-w-xs mx-auto">
              <li>• Recovery-based task scheduling</li>
              <li>• Sleep quality impact on focus</li>
              <li>• ADHD symptom correlation tracking</li>
              <li>• Personalized productivity insights</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // Show health metrics if connected
  const getScoreColor = (score?: number): string => {
    if (!score) return 'text-slate-400'
    if (score >= 75) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score?: number): string => {
    if (!score) return 'bg-slate-50'
    if (score >= 75) return 'bg-green-50'
    if (score >= 50) return 'bg-yellow-50'
    return 'bg-red-50'
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="text-lg font-medium text-slate-800">Health Metrics</div>
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Recovery Score */}
        <div className={`${getScoreBgColor(health?.recovery_score)} rounded-lg p-3`}>
          <div className="text-xs text-slate-500 mb-1">Recovery</div>
          <div className={`text-2xl font-bold ${getScoreColor(health?.recovery_score)}`}>
            {health?.recovery_score ? `${health.recovery_score}%` : '--'}
          </div>
        </div>

        {/* Sleep Quality */}
        <div className={`${getScoreBgColor(health?.sleep_quality)} rounded-lg p-3`}>
          <div className="text-xs text-slate-500 mb-1">Sleep Quality</div>
          <div className={`text-2xl font-bold ${getScoreColor(health?.sleep_quality)}`}>
            {health?.sleep_quality ? `${health.sleep_quality}%` : '--'}
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-50 rounded-lg p-2">
          <div className="text-xs text-slate-500 mb-1">HRV</div>
          <div className="text-sm font-medium text-slate-800">
            {health?.hrv_score ? `${health.hrv_score.toFixed(1)}` : '--'}
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-2">
          <div className="text-xs text-slate-500 mb-1">RHR</div>
          <div className="text-sm font-medium text-slate-800">
            {health?.resting_heart_rate || '--'}
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-2">
          <div className="text-xs text-slate-500 mb-1">Sleep Eff.</div>
          <div className="text-sm font-medium text-slate-800">
            {health?.sleep_efficiency ? `${health.sleep_efficiency}%` : '--'}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-slate-400 text-center">
        {status?.profile?.name && <span>Connected as {status.profile.name}</span>}
        {health?.last_updated && (
          <div>Last sync: {new Date(health.last_updated).toLocaleTimeString()}</div>
        )}
      </div>
    </div>
  )
}