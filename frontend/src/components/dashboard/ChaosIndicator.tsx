import React, { useState, useEffect } from 'react'

interface ChaosMetric {
  score: number
  level: 'low' | 'moderate' | 'high' | 'critical'
  factors: string[]
  lastUpdated: string
}

export default function ChaosIndicator() {
  const [chaos, setChaos] = useState<ChaosMetric | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChaosData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/chaos/current')
        if (response.ok) {
          const data = await response.json()
          setChaos(data)
        } else {
          // Mock data for development
          setChaos({
            score: Math.floor(Math.random() * 100),
            level: 'moderate',
            factors: ['Email backlog', 'Meeting conflicts', 'Pending decisions'],
            lastUpdated: new Date().toISOString()
          })
        }
      } catch (error) {
        console.error('Error fetching chaos data:', error)
        // Mock data on error
        setChaos({
          score: Math.floor(Math.random() * 100),
          level: 'low',
          factors: ['System running smoothly'],
          lastUpdated: new Date().toISOString()
        })
      } finally {
        setLoading(false)
      }
    }

    fetchChaosData()
    const interval = setInterval(fetchChaosData, 2 * 60 * 1000) // Every 2 minutes
    return () => clearInterval(interval)
  }, [])

  const getChaosIcon = (level: string) => {
    switch (level) {
      case 'low': return '🧘'
      case 'moderate': return '😐'
      case 'high': return '😰'
      case 'critical': return '🚨'
      default: return '❓'
    }
  }

  const getChaosColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600'
      case 'moderate': return 'text-yellow-600'
      case 'high': return 'text-orange-600'
      case 'critical': return 'text-red-600'
      default: return 'text-slate-600'
    }
  }

  const getChaosBgColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-50'
      case 'moderate': return 'bg-yellow-50'
      case 'high': return 'bg-orange-50'
      case 'critical': return 'bg-red-50'
      default: return 'bg-slate-50'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-5 bg-slate-200 rounded w-1/2 mb-4"></div>
          <div className="h-16 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!chaos) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="text-center text-slate-500">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-sm">Chaos meter unavailable</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-800">Chaos Meter</h3>
        <div className="text-xs text-slate-400">
          Updated {new Date(chaos.lastUpdated).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>

      {/* Chaos Score Display */}
      <div className={`${getChaosBgColor(chaos.level)} rounded-lg p-4 mb-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{getChaosIcon(chaos.level)}</div>
            <div>
              <div className={`text-2xl font-bold ${getChaosColor(chaos.level)}`}>
                {chaos.score}%
              </div>
              <div className={`text-sm font-medium ${getChaosColor(chaos.level)} capitalize`}>
                {chaos.level} chaos
              </div>
            </div>
          </div>
          
          {/* Chaos Bar */}
          <div className="w-20">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  chaos.level === 'low' ? 'bg-green-500' :
                  chaos.level === 'moderate' ? 'bg-yellow-500' :
                  chaos.level === 'high' ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${chaos.score}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Chaos Factors */}
      <div className="mb-4">
        <div className="text-sm font-medium text-slate-700 mb-2">Contributing Factors:</div>
        <div className="space-y-1">
          {chaos.factors.map((factor, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
              <span>{factor}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="border-t border-slate-100 pt-3">
        <div className="text-xs text-slate-500">
          {chaos.level === 'low' && "Great! Your environment is calm and conducive to deep work."}
          {chaos.level === 'moderate' && "Some chaos detected. Consider prioritizing and organizing."}
          {chaos.level === 'high' && "High chaos! Focus on urgent tasks and clearing blockers."}
          {chaos.level === 'critical' && "Critical chaos! Stop, breathe, and tackle one thing at a time."}
        </div>
      </div>
    </div>
  )
}