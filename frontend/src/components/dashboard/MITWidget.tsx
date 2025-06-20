import React, { useState, useEffect } from 'react'

interface MIT {
  id: string
  title: string
  status: 'not_started' | 'doing' | 'done'
  priority: number
  estimated_minutes?: number
  completed_at?: string
}

export default function MITWidget() {
  const [mits, setMits] = useState<MIT[]>([])
  const [loading, setLoading] = useState(true)
  const [newMit, setNewMit] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    const fetchMITs = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/tasks?is_mit=true&limit=3')
        if (response.ok) {
          const data = await response.json()
          setMits(data.tasks || [])
        } else {
          // Mock data for development
          setMits([
            {
              id: '1',
              title: 'Complete WHOOP integration testing',
              status: 'doing',
              priority: 5,
              estimated_minutes: 45
            },
            {
              id: '2', 
              title: 'Review dashboard design feedback',
              status: 'not_started',
              priority: 4,
              estimated_minutes: 30
            },
            {
              id: '3',
              title: 'Deploy system status monitoring',
              status: 'done',
              priority: 5,
              estimated_minutes: 60,
              completed_at: new Date().toISOString()
            }
          ])
        }
      } catch (error) {
        console.error('Error fetching MITs:', error)
        setMits([])
      } finally {
        setLoading(false)
      }
    }

    fetchMITs()
    const interval = setInterval(fetchMITs, 5 * 60 * 1000) // Every 5 minutes
    return () => clearInterval(interval)
  }, [])

  const handleAddMIT = async () => {
    if (!newMit.trim()) return
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newMit,
          is_mit: true,
          priority: 5,
          status: 'not_started'
        })
      })
      
      if (response.ok) {
        const newTask = await response.json()
        setMits(prev => [newTask, ...prev.slice(0, 2)])
        setNewMit('')
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Error adding MIT:', error)
    }
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'not_started' : 
                     currentStatus === 'not_started' ? 'doing' : 'done'
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        setMits(prev => prev.map(mit => 
          mit.id === id ? { ...mit, status: newStatus as any } : mit
        ))
      }
    } catch (error) {
      console.error('Error updating MIT:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return ''
      case 'doing': return '='
      default: return 'U'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'text-green-600'
      case 'doing': return 'text-blue-600'
      default: return 'text-slate-500'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-5 bg-slate-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const completedToday = mits.filter(m => m.status === 'done').length
  const totalMits = mits.length

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-slate-800">MITs (Most Important Tasks)</h3>
          <span className="text-sm text-slate-500">({completedToday}/{totalMits})</span>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-slate-400 hover:text-slate-600 text-lg"
        >
          +
        </button>
      </div>

      {/* Add MIT Form */}
      {showAddForm && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMit}
              onChange={(e) => setNewMit(e.target.value)}
              placeholder="Add a Most Important Task..."
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAddMIT()}
            />
            <button
              onClick={handleAddMIT}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* MIT List */}
      <div className="space-y-3 mb-4">
        {mits.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <div className="text-2xl mb-2">P</div>
            <div className="text-sm">No MITs for today</div>
            <div className="text-xs text-slate-400 mt-1">Add your most important tasks</div>
          </div>
        ) : (
          mits.map((mit) => (
            <div
              key={mit.id}
              className={`p-3 rounded-lg border-l-4 ${
                mit.status === 'done' 
                  ? 'border-green-400 bg-green-50' 
                  : mit.status === 'doing'
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-orange-400 bg-orange-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => toggleStatus(mit.id, mit.status)}
                    className="text-lg hover:scale-110 transition-transform"
                  >
                    {getStatusIcon(mit.status)}
                  </button>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${
                      mit.status === 'done' 
                        ? 'line-through text-slate-500' 
                        : 'text-slate-800'
                    }`}>
                      {mit.title}
                    </div>
                    {mit.estimated_minutes && (
                      <div className="text-xs text-slate-500 mt-1">
                        Est. {mit.estimated_minutes} minutes
                      </div>
                    )}
                  </div>
                </div>
                <div className={`text-xs ${getStatusColor(mit.status)} font-medium`}>
                  {mit.status === 'done' ? 'Done' : 
                   mit.status === 'doing' ? 'In Progress' : 'To Do'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Progress Bar */}
      {totalMits > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Progress</span>
            <span>{Math.round((completedToday / totalMits) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${(completedToday / totalMits) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center">
        <div className="text-xs text-slate-400">
          Most Important Tasks • Focus on what matters most
        </div>
      </div>
    </div>
  )
}