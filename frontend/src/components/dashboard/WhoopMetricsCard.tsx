import React from 'react'
import { useWhoopConnection } from '../../hooks/useWhoop'
import type { WhoopHealthData, WhoopStatus } from '../../types/whoop'

interface WhoopMetricsCardProps {
  health: WhoopHealthData
  status: WhoopStatus
}

function getScoreColor(score?: number): string {
  if (!score) return 'text-slate-400'
  if (score >= 75) return 'text-green-600'
  if (score >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

function getScoreBgColor(score?: number): string {
  if (!score) return 'bg-slate-50'
  if (score >= 75) return 'bg-green-50'
  if (score >= 50) return 'bg-yellow-50'
  return 'bg-red-50'
}

function formatTimeAgo(timestamp?: string): string {
  if (!timestamp) return 'Unknown'
  
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  if (diffMins > 0) return `${diffMins}m ago`
  return 'Just now'
}

export default function WhoopMetricsCard({ health, status }: WhoopMetricsCardProps) {
  const { disconnect, disconnecting, syncData } = useWhoopConnection()

  const handleSync = async () => {
    try {
      await syncData(7)
      // Could add a toast notification here
      console.log('WHOOP data sync initiated')
    } catch (error) {
      console.error('Failed to sync WHOOP data:', error)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="text-lg font-medium text-slate-800">Health Metrics</div>
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition-colors"
          >
            Sync
          </button>
          <button
            onClick={disconnect}
            disabled={disconnecting}
            className="text-xs px-2 py-1 bg-red-50 hover:bg-red-100 rounded text-red-600 transition-colors disabled:opacity-50"
          >
            {disconnecting ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Recovery Score */}
        <div className={`${getScoreBgColor(health.recovery_score)} rounded-lg p-3`}>
          <div className="text-xs text-slate-500 mb-1">Recovery</div>
          <div className={`text-2xl font-bold ${getScoreColor(health.recovery_score)}`}>
            {health.recovery_score ? `${health.recovery_score}%` : '--'}
          </div>
          <div className="text-xs text-slate-500">
            {health.recovery_score ? 
              (health.recovery_score >= 75 ? 'Excellent' : 
               health.recovery_score >= 50 ? 'Moderate' : 'Low') : 
              'No data'
            }
          </div>
        </div>

        {/* Sleep Quality */}
        <div className={`${getScoreBgColor(health.sleep_quality)} rounded-lg p-3`}>
          <div className="text-xs text-slate-500 mb-1">Sleep Quality</div>
          <div className={`text-2xl font-bold ${getScoreColor(health.sleep_quality)}`}>
            {health.sleep_quality ? `${health.sleep_quality}%` : '--'}
          </div>
          <div className="text-xs text-slate-500">
            {health.sleep_duration ? `${health.sleep_duration.toFixed(1)}h` : 'No data'}
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* HRV */}
        <div className="bg-slate-50 rounded-lg p-2">
          <div className="text-xs text-slate-500 mb-1">HRV</div>
          <div className="text-sm font-medium text-slate-800">
            {health.hrv_score ? `${health.hrv_score.toFixed(1)}` : '--'}
          </div>
        </div>

        {/* Resting HR */}
        <div className="bg-slate-50 rounded-lg p-2">
          <div className="text-xs text-slate-500 mb-1">Resting HR</div>
          <div className="text-sm font-medium text-slate-800">
            {health.resting_heart_rate ? `${health.resting_heart_rate}` : '--'}
          </div>
        </div>

        {/* Sleep Efficiency */}
        <div className="bg-slate-50 rounded-lg p-2">
          <div className="text-xs text-slate-500 mb-1">Sleep Eff.</div>
          <div className="text-sm font-medium text-slate-800">
            {health.sleep_efficiency ? `${health.sleep_efficiency}%` : '--'}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div>
          {status.profile?.name && (
            <span>Connected as {status.profile.name}</span>
          )}
        </div>
        <div>
          Last sync: {formatTimeAgo(health.last_updated)}
        </div>
      </div>
    </div>
  )
}