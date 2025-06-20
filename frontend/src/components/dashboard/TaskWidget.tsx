import React, { useState, useEffect } from 'react'
import { useWhoopHealth } from '../../hooks/useWhoop'
import TaskManagerModal from './TaskManagerModal'

interface Task {
  id: string
  title: string
  status: 'not_started' | 'doing' | 'done' | 'blocked' | 'paused'
  priority: number
  is_mit: boolean
  estimated_minutes?: number
  due_date?: string
  tags: string[]
}

interface TaskData {
  tasks: Task[]
  total: number
  mit_tasks: Task[]
}

export default function TaskWidget() {
  const [tasks, setTasks] = useState<TaskData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTaskManager, setShowTaskManager] = useState(false)
  const { data: health } = useWhoopHealth()

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/tasks?limit=10')
        if (!response.ok) throw new Error('Failed to fetch tasks')
        const data = await response.json()
        setTasks(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching tasks:', err)
        setError('Failed to load tasks')
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
    // Refresh every 5 minutes
    const interval = setInterval(fetchTasks, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        // Refresh tasks after update
        const taskResponse = await fetch('http://localhost:8000/api/v1/tasks?limit=10')
        if (taskResponse.ok) {
          const data = await taskResponse.json()
          setTasks(data)
        }
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  // Generate health-based task recommendations
  const getHealthBasedRecommendations = () => {
    if (!health || !health.whoop_connected) return null

    const recovery = health.recovery_score || 0
    const sleep = health.sleep_quality || 0
    const avgScore = (recovery + sleep) / 2

    if (avgScore >= 75) {
      return {
        level: '🟢',
        message: 'High energy day - tackle complex projects and MITs',
        suggestion: 'Focus on creative work and problem-solving tasks',
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      }
    } else if (avgScore >= 50) {
      return {
        level: '🟡',
        message: 'Moderate energy - break large tasks into smaller chunks',
        suggestion: 'Focus on routine tasks with regular breaks',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
      }
    } else {
      return {
        level: '🔴',
        message: 'Low energy - prioritize rest and light tasks',
        suggestion: 'Focus on planning, organization, and easy wins',
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      }
    }
  }

  const getTaskRecommendations = (tasks: Task[]) => {
    if (!health || !health.whoop_connected || !tasks || !tasks.length) return []

    const recovery = health.recovery_score || 0
    
    // Sort tasks based on recovery score
    if (recovery >= 75) {
      // High recovery: prioritize complex, high-priority tasks
      return tasks
        .filter(t => t.status !== 'done')
        .sort((a, b) => {
          // MIT tasks first, then by priority, then by estimated time (complex tasks first)
          if (a.is_mit !== b.is_mit) return a.is_mit ? -1 : 1
          if (a.priority !== b.priority) return b.priority - a.priority
          return (b.estimated_minutes || 0) - (a.estimated_minutes || 0)
        })
        .slice(0, 5)
    } else if (recovery >= 50) {
      // Moderate recovery: balanced approach
      return tasks
        .filter(t => t.status !== 'done')
        .sort((a, b) => {
          if (a.is_mit !== b.is_mit) return a.is_mit ? -1 : 1
          return b.priority - a.priority
        })
        .slice(0, 5)
    } else {
      // Low recovery: prioritize easier, shorter tasks
      return tasks
        .filter(t => t.status !== 'done')
        .sort((a, b) => {
          // Easier tasks first (shorter estimated time)
          if (a.is_mit !== b.is_mit) return a.is_mit ? -1 : 1
          return (a.estimated_minutes || 60) - (b.estimated_minutes || 60)
        })
        .slice(0, 5)
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

  if (error || !tasks) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="text-center text-slate-500">
          <div className="text-2xl mb-2">📋</div>
          <div className="text-sm">Tasks unavailable</div>
        </div>
      </div>
    )
  }

  const healthRec = getHealthBasedRecommendations()
  const recommendedTasks = getTaskRecommendations(tasks?.tasks || [])
  const completedToday = tasks?.tasks?.filter(t => t.status === 'done').length || 0
  const totalTasks = tasks?.tasks?.filter(t => t.status !== 'done').length || 0

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-800">Smart Task Planner</h3>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500">
            {completedToday} done • {totalTasks} remaining
          </div>
          <button
            onClick={() => setShowTaskManager(true)}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
            title="Open full task manager"
          >
            📋 Manage
          </button>
        </div>
      </div>

      {/* Health-based Recommendations */}
      {healthRec && (
        <div className={`${healthRec.bgColor} rounded-lg p-3 mb-4`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{healthRec.level}</span>
            <span className={`text-sm font-medium ${healthRec.color}`}>
              Energy Level Guidance
            </span>
          </div>
          <div className="text-xs text-slate-700 mb-1">{healthRec.message}</div>
          <div className="text-xs text-slate-600">{healthRec.suggestion}</div>
        </div>
      )}

      {/* MIT Tasks */}
      {tasks?.mit_tasks?.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-slate-800 mb-2">
            ⭐ Most Important Tasks
          </div>
          <div className="space-y-2">
            {tasks?.mit_tasks?.slice(0, 2).map((task) => (
              <div
                key={task.id}
                className={`p-2 rounded border-l-4 ${
                  task.status === 'done'
                    ? 'border-green-400 bg-green-50'
                    : 'border-orange-400 bg-orange-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`text-sm ${task.status === 'done' ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                    {task.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {task.estimated_minutes ? `${task.estimated_minutes}m` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Tasks Based on Health */}
      {recommendedTasks.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-slate-800 mb-2">
            💡 Recommended for Your Energy Level
          </div>
          <div className="space-y-2">
            {recommendedTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-2 hover:bg-slate-50 rounded"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority >= 5 ? 'bg-red-400' :
                    task.priority >= 3 ? 'bg-yellow-400' : 'bg-green-400'
                  }`}></div>
                  <div className="text-sm text-slate-800">{task.title}</div>
                </div>
                <div className="text-xs text-slate-500">
                  {task.estimated_minutes ? `${task.estimated_minutes}m` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-slate-50 rounded-lg p-2">
          <div className="text-lg font-medium text-slate-800">{completedToday}</div>
          <div className="text-xs text-slate-500">Completed</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <div className="text-lg font-medium text-slate-800">{tasks?.mit_tasks?.length || 0}</div>
          <div className="text-xs text-slate-500">MITs</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <div className="text-lg font-medium text-slate-800">{totalTasks}</div>
          <div className="text-xs text-slate-500">Pending</div>
        </div>
      </div>

      {/* Health Integration Status */}
      {health?.whoop_connected && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Health-optimized recommendations</span>
            </div>
            <div>
              Recovery: {health.recovery_score ? `${health.recovery_score}%` : '--'}
            </div>
          </div>
        </div>
      )}

      {/* Task Manager Modal */}
      <TaskManagerModal
        isOpen={showTaskManager}
        onClose={() => setShowTaskManager(false)}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
  )
}