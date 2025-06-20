import React, { useState } from 'react'
import { useWhoopRecovery } from '../../hooks/useWhoop'

export default function WhoopRecoveryWidget() {
  const [days, setDays] = useState(7)
  const { data, loading, error } = useWhoopRecovery(days)

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-5 bg-slate-200 rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-slate-200 rounded-lg mb-4"></div>
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="text-center text-slate-500">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-sm">Recovery data unavailable</div>
        </div>
      </div>
    )
  }

  const latestRecord = data.records[0]
  const avgRecovery = data.records.length > 0 
    ? data.records.reduce((sum, r) => sum + (r.recovery_score || 0), 0) / data.records.length 
    : 0

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-slate-400'
    if (score >= 75) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score?: number) => {
    if (!score) return 'bg-slate-50'
    if (score >= 75) return 'bg-green-50'
    if (score >= 50) return 'bg-yellow-50'
    return 'bg-red-50'
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-800">Recovery Tracking</h3>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="text-xs px-2 py-1 border border-slate-200 rounded text-slate-600"
        >
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
        </select>
      </div>

      {/* Latest Recovery Score */}
      {latestRecord && (
        <div className={`${getScoreBg(latestRecord.recovery_score)} rounded-lg p-4 mb-4`}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-600">Today's Recovery</div>
            <div className="text-xs text-slate-500">
              {new Date(latestRecord.created_at).toLocaleDateString()}
            </div>
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(latestRecord.recovery_score)}`}>
            {latestRecord.recovery_score ? `${latestRecord.recovery_score}%` : '--'}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            {latestRecord.recovery_score ? 
              (latestRecord.recovery_score >= 75 ? 'Fully Recovered' : 
               latestRecord.recovery_score >= 50 ? 'Moderately Recovered' : 'Low Recovery') : 
              'No data available'
            }
          </div>
        </div>
      )}

      {/* Recovery Trend */}
      <div className="mb-4">
        <div className="text-sm text-slate-600 mb-2">Recovery Trend ({days} days)</div>
        <div className="flex items-end gap-1 h-16">
          {data.records.slice(0, 14).reverse().map((record, index) => {
            const height = record.recovery_score ? (record.recovery_score / 100) * 100 : 10
            return (
              <div
                key={record.id}
                className="flex-1 flex flex-col justify-end"
                title={`${new Date(record.created_at).toLocaleDateString()}: ${record.recovery_score || 'No data'}%`}
              >
                <div
                  className={`w-full rounded-t ${getScoreColor(record.recovery_score).replace('text-', 'bg-')}`}
                  style={{ height: `${height}%` }}
                ></div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>Older</span>
          <span>Recent</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-1">Average</div>
          <div className={`text-lg font-medium ${getScoreColor(avgRecovery)}`}>
            {avgRecovery > 0 ? `${Math.round(avgRecovery)}%` : '--'}
          </div>
        </div>
        
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-1">HRV (Latest)</div>
          <div className="text-lg font-medium text-slate-800">
            {latestRecord?.hrv_rmssd ? `${latestRecord.hrv_rmssd.toFixed(1)}` : '--'}
          </div>
        </div>
        
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-1">RHR (Latest)</div>
          <div className="text-lg font-medium text-slate-800">
            {latestRecord?.resting_heart_rate || '--'}
          </div>
        </div>
      </div>

      {/* ADHD Insights */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-xs text-blue-600 font-medium mb-1">💡 ADHD Insight</div>
        <div className="text-xs text-blue-700">
          {avgRecovery >= 70 
            ? 'Good recovery supports focus and attention. Consider scheduling MITs (Most Important Tasks) today.'
            : avgRecovery >= 50
            ? 'Moderate recovery. Break complex tasks into smaller chunks and take regular breaks.'
            : 'Low recovery may affect attention span. Focus on lighter tasks and defer MITs until recovery improves.'
          }
        </div>
      </div>
    </div>
  )
}