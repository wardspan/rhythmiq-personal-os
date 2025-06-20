import React, { useState } from 'react'
import { useWhoopADHDInsights } from '../../hooks/useWhoop'

export default function WhoopInsightsWidget() {
  const [days, setDays] = useState(30)
  const { data, loading, error } = useWhoopADHDInsights(days)

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-5 bg-slate-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-slate-200 rounded-lg"></div>
            <div className="h-16 bg-slate-200 rounded-lg"></div>
            <div className="h-16 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="text-center text-slate-500">
          <div className="text-2xl mb-2">🧠</div>
          <div className="text-sm">ADHD insights unavailable</div>
          <div className="text-xs text-slate-400 mt-1">
            Need more data for correlation analysis
          </div>
        </div>
      </div>
    )
  }

  const { insights, data_points, recommendations } = data

  const getInsightColor = (value?: number, threshold: { good: number; moderate: number }) => {
    if (!value) return 'text-slate-400'
    if (value >= threshold.good) return 'text-green-600'
    if (value >= threshold.moderate) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getInsightBg = (value?: number, threshold: { good: number; moderate: number }) => {
    if (!value) return 'bg-slate-50'
    if (value >= threshold.good) return 'bg-green-50'
    if (value >= threshold.moderate) return 'bg-yellow-50'
    return 'bg-red-50'
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-800">ADHD Health Insights</h3>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="text-xs px-2 py-1 border border-slate-200 rounded text-slate-600"
        >
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
          <option value={60}>60 days</option>
        </select>
      </div>

      {/* Data Summary */}
      <div className="bg-slate-50 rounded-lg p-3 mb-4">
        <div className="text-xs text-slate-500 mb-2">Analysis based on:</div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium text-slate-800">{data_points.recovery_records}</div>
            <div className="text-xs text-slate-500">Recovery records</div>
          </div>
          <div>
            <div className="font-medium text-slate-800">{data_points.sleep_records}</div>
            <div className="text-xs text-slate-500">Sleep records</div>
          </div>
          <div>
            <div className="font-medium text-slate-800">{data_points.analysis_period_days}</div>
            <div className="text-xs text-slate-500">Days analyzed</div>
          </div>
        </div>
      </div>

      {/* Sleep Consistency */}
      <div className={`${getInsightBg(insights.sleep_consistency.sleep_duration_variance, { good: 1, moderate: 1.5 })} rounded-lg p-4 mb-3`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="text-lg">😴</div>
          <div className="text-sm font-medium text-slate-800">Sleep Consistency</div>
        </div>
        <div className="text-xs text-slate-600 mb-2">
          {insights.sleep_consistency.description}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-slate-500">Bedtime Variance</div>
            <div className={`text-sm font-medium ${getInsightColor(insights.sleep_consistency.average_bedtime_variance, { good: 0.5, moderate: 1 })}`}>
              {insights.sleep_consistency.average_bedtime_variance 
                ? `±${insights.sleep_consistency.average_bedtime_variance.toFixed(1)}h` 
                : 'No data'}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Duration Variance</div>
            <div className={`text-sm font-medium ${getInsightColor(insights.sleep_consistency.sleep_duration_variance, { good: 1, moderate: 1.5 })}`}>
              {insights.sleep_consistency.sleep_duration_variance 
                ? `±${insights.sleep_consistency.sleep_duration_variance.toFixed(1)}h` 
                : 'No data'}
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Patterns */}
      <div className={`${getInsightBg(insights.recovery_patterns.average_recovery, { good: 70, moderate: 50 })} rounded-lg p-4 mb-3`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="text-lg">📊</div>
          <div className="text-sm font-medium text-slate-800">Recovery Patterns</div>
        </div>
        <div className="text-xs text-slate-600 mb-2">
          {insights.recovery_patterns.description}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-slate-500">Average Recovery</div>
            <div className={`text-sm font-medium ${getInsightColor(insights.recovery_patterns.average_recovery, { good: 70, moderate: 50 })}`}>
              {insights.recovery_patterns.average_recovery 
                ? `${insights.recovery_patterns.average_recovery}%` 
                : 'No data'}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Low Recovery Days</div>
            <div className="text-sm font-medium text-slate-800">
              {insights.recovery_patterns.low_recovery_days} days
            </div>
          </div>
        </div>
      </div>

      {/* Heart Rate Variability */}
      <div className={`${getInsightBg(insights.heart_rate_variability.average_hrv, { good: 30, moderate: 20 })} rounded-lg p-4 mb-4`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="text-lg">💓</div>
          <div className="text-sm font-medium text-slate-800">Heart Rate Variability</div>
        </div>
        <div className="text-xs text-slate-600 mb-2">
          {insights.heart_rate_variability.description}
        </div>
        <div>
          <div className="text-xs text-slate-500">Average HRV</div>
          <div className={`text-sm font-medium ${getInsightColor(insights.heart_rate_variability.average_hrv, { good: 30, moderate: 20 })}`}>
            {insights.heart_rate_variability.average_hrv 
              ? `${insights.heart_rate_variability.average_hrv.toFixed(1)} ms` 
              : 'No data'}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-lg">💡</div>
          <div className="text-sm font-medium text-blue-800">Personalized Recommendations</div>
        </div>
        <div className="space-y-2">
          {recommendations.slice(0, 3).map((rec, index) => (
            <div key={index} className="text-xs text-blue-700 flex items-start gap-2">
              <div className="text-blue-400 mt-0.5">•</div>
              <div>{rec}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}