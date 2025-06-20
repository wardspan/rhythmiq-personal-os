import React, { useState } from 'react'
import { useWhoopSleep } from '../../hooks/useWhoop'

export default function WhoopSleepWidget() {
  const [days, setDays] = useState(7)
  const { data, loading, error } = useWhoopSleep(days)

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-5 bg-slate-200 rounded w-1/2 mb-4"></div>
          <div className="h-24 bg-slate-200 rounded-lg mb-4"></div>
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 rounded"></div>
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
          <div className="text-2xl mb-2">😴</div>
          <div className="text-sm">Sleep data unavailable</div>
        </div>
      </div>
    )
  }

  const latestRecord = data.records[0]
  const avgDuration = data.records.length > 0 
    ? data.records.reduce((sum, r) => sum + (r.duration_hours || 0), 0) / data.records.length 
    : 0
  const avgScore = data.records.length > 0 
    ? data.records.reduce((sum, r) => sum + (r.sleep_score || 0), 0) / data.records.length 
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-800">Sleep Analysis</h3>
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

      {/* Latest Sleep */}
      {latestRecord && (
        <div className={`${getScoreBg(latestRecord.sleep_score)} rounded-lg p-4 mb-4`}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-600">Last Night</div>
            <div className="text-xs text-slate-500">
              {formatTime(latestRecord.start_time)} - {formatTime(latestRecord.end_time)}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <div className={`text-2xl font-bold ${getScoreColor(latestRecord.sleep_score)}`}>
                {latestRecord.sleep_score ? `${latestRecord.sleep_score}%` : '--'}
              </div>
              <div className="text-xs text-slate-500">Sleep Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">
                {latestRecord.duration_hours ? `${latestRecord.duration_hours.toFixed(1)}h` : '--'}
              </div>
              <div className="text-xs text-slate-500">Duration</div>
            </div>
          </div>
        </div>
      )}

      {/* Sleep Stages */}
      {latestRecord?.sleep_stages && (
        <div className="mb-4">
          <div className="text-sm text-slate-600 mb-2">Sleep Stages (Latest)</div>
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-blue-50 rounded p-2">
              <div className="text-xs text-blue-600 mb-1">Light</div>
              <div className="text-sm font-medium text-blue-800">
                {latestRecord.sleep_stages.light_sleep_hours 
                  ? `${latestRecord.sleep_stages.light_sleep_hours.toFixed(1)}h` 
                  : '--'}
              </div>
            </div>
            <div className="bg-indigo-50 rounded p-2">
              <div className="text-xs text-indigo-600 mb-1">Deep</div>
              <div className="text-sm font-medium text-indigo-800">
                {latestRecord.sleep_stages.deep_sleep_hours 
                  ? `${latestRecord.sleep_stages.deep_sleep_hours.toFixed(1)}h` 
                  : '--'}
              </div>
            </div>
            <div className="bg-purple-50 rounded p-2">
              <div className="text-xs text-purple-600 mb-1">REM</div>
              <div className="text-sm font-medium text-purple-800">
                {latestRecord.sleep_stages.rem_sleep_hours 
                  ? `${latestRecord.sleep_stages.rem_sleep_hours.toFixed(1)}h` 
                  : '--'}
              </div>
            </div>
            <div className="bg-red-50 rounded p-2">
              <div className="text-xs text-red-600 mb-1">Awake</div>
              <div className="text-sm font-medium text-red-800">
                {latestRecord.sleep_stages.awake_hours 
                  ? `${latestRecord.sleep_stages.awake_hours.toFixed(1)}h` 
                  : '--'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sleep Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-1">Avg Duration</div>
          <div className="text-lg font-medium text-slate-800">
            {avgDuration > 0 ? `${avgDuration.toFixed(1)}h` : '--'}
          </div>
        </div>
        
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-1">Avg Score</div>
          <div className={`text-lg font-medium ${getScoreColor(avgScore)}`}>
            {avgScore > 0 ? `${Math.round(avgScore)}%` : '--'}
          </div>
        </div>
        
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-500 mb-1">Efficiency</div>
          <div className="text-lg font-medium text-slate-800">
            {latestRecord?.sleep_efficiency_percentage 
              ? `${latestRecord.sleep_efficiency_percentage}%` 
              : '--'}
          </div>
        </div>
      </div>

      {/* Sleep Consistency Insights */}
      <div className="p-3 bg-purple-50 rounded-lg">
        <div className="text-xs text-purple-600 font-medium mb-1">😴 Sleep Insights</div>
        <div className="text-xs text-purple-700">
          {latestRecord ? (
            latestRecord.duration_hours && latestRecord.duration_hours >= 7
              ? 'Good sleep duration! Consistent sleep schedule supports ADHD symptom management.'
              : latestRecord.duration_hours && latestRecord.duration_hours < 6
              ? 'Short sleep may impact focus and attention. Try to prioritize rest tonight.'
              : 'Aim for 7-9 hours of sleep for optimal cognitive function and ADHD management.'
          ) : (
            'Track your sleep patterns to understand their impact on focus and productivity.'
          )}
        </div>
      </div>
    </div>
  )
}