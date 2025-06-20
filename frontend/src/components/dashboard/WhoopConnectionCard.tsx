import React from 'react'
import { useWhoopConnection } from '../../hooks/useWhoop'
import type { WhoopStatus } from '../../types/whoop'

interface WhoopConnectionCardProps {
  status?: WhoopStatus | null
}

export default function WhoopConnectionCard({ status }: WhoopConnectionCardProps) {
  const { connect, connecting, error } = useWhoopConnection()

  const isEnabled = status?.enabled ?? false

  if (!isEnabled) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="text-center">
          <div className="text-3xl mb-3">💓</div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">Health Tracking</h3>
          <p className="text-sm text-slate-500 mb-4">
            WHOOP integration is not configured on this server.
          </p>
          <div className="text-xs text-slate-400">
            Contact your administrator to enable health tracking.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="text-center">
        <div className="text-3xl mb-3">💓</div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">Connect WHOOP</h3>
        <p className="text-sm text-slate-500 mb-4">
          Connect your WHOOP device to track recovery, sleep, and strain data.
          This helps optimize your productivity based on your health metrics.
        </p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}
        
        <button
          onClick={connect}
          disabled={connecting}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {connecting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Connecting...
            </div>
          ) : (
            'Connect WHOOP'
          )}
        </button>
        
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