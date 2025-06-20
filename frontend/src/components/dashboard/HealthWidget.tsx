import React from 'react'
import { useWhoopHealth, useWhoopStatus } from '../../hooks/useWhoop'
import WhoopConnectionCard from './WhoopConnectionCard'
import WhoopMetricsCard from './WhoopMetricsCard'

export default function HealthWidget() {
  const { data: health, loading: healthLoading, error: healthError } = useWhoopHealth()
  const { data: status, loading: statusLoading, error: statusError } = useWhoopStatus()

  // Show connection card if not connected
  if (!statusLoading && (!status?.connected || !health?.whoop_connected)) {
    return <WhoopConnectionCard status={status} />
  }

  // Loading state
  if (healthLoading || statusLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="h-20 bg-slate-200 rounded-lg"></div>
            <div className="h-20 bg-slate-200 rounded-lg"></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="h-16 bg-slate-200 rounded-lg"></div>
            <div className="h-16 bg-slate-200 rounded-lg"></div>
            <div className="h-16 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (healthError || statusError) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="text-center text-slate-500">
          <div className="text-2xl mb-2">=“</div>
          <div className="text-sm">Health data unavailable</div>
          <div className="text-xs text-slate-400 mt-1">
            {healthError || statusError}
          </div>
        </div>
      </div>
    )
  }

  return <WhoopMetricsCard health={health!} status={status!} />
}