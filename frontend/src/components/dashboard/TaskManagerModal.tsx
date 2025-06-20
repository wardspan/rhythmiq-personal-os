import React, { useState, useEffect, useCallback } from 'react'
import TaskEditModal from './TaskEditModal'

interface Task {
  id: string
  title: string
  description?: string
  status: 'not_started' | 'doing' | 'done' | 'blocked' | 'paused'
  priority: number
  is_mit: boolean
  is_starred?: boolean
  estimated_minutes?: number
  due_date?: string
  tags: string[]
  project?: string
  created_at: string
  updated_at?: string
}

interface TaskManagerModalProps {
  isOpen: boolean
  onClose: () => void
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
}

export default function TaskManagerModal({ isOpen, onClose, onTaskUpdate }: TaskManagerModalProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'priority' | 'created_at' | 'status' | 'starred'>('priority')
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/v1/tasks?limit=100')
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || [])
      } else {
        // Mock data for development
        setTasks([
          {
            id: '1',
            title: 'Complete WHOOP integration testing',
            description: 'Test all WHOOP API endpoints and data visualization',
            status: 'doing',
            priority: 5,
            is_mit: true,
            is_starred: true,
            estimated_minutes: 120,
            tags: ['integration', 'testing', 'whoop'],
            project: 'Health Integration',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Design task management UI improvements',
            description: 'Create mockups for enhanced task interface',
            status: 'not_started',
            priority: 4,
            is_mit: false,
            is_starred: false,
            estimated_minutes: 90,
            due_date: '2024-01-15',
            tags: ['design', 'ui', 'tasks'],
            project: 'Dashboard Enhancement',
            created_at: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '3',
            title: 'Implement chaos detection algorithms',
            description: 'Build machine learning models for detecting productivity chaos patterns',
            status: 'blocked',
            priority: 5,
            is_mit: true,
            is_starred: false,
            estimated_minutes: 180,
            tags: ['ml', 'algorithms', 'chaos'],
            project: 'Chaos Detection',
            created_at: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: '4',
            title: 'Write documentation for API endpoints',
            description: 'Document all REST API endpoints with examples',
            status: 'not_started',
            priority: 2,
            is_mit: false,
            is_starred: false,
            estimated_minutes: 60,
            tags: ['documentation', 'api'],
            project: 'Documentation',
            created_at: new Date(Date.now() - 259200000).toISOString()
          },
          {
            id: '5',
            title: 'Optimize database queries for performance',
            description: 'Analyze and improve slow database queries',
            status: 'done',
            priority: 3,
            is_mit: false,
            is_starred: true,
            estimated_minutes: 45,
            tags: ['database', 'performance'],
            project: 'Backend Optimization',
            created_at: new Date(Date.now() - 345600000).toISOString()
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchTasks()
    }
  }, [isOpen, fetchTasks])

  // Filter and sort tasks
  useEffect(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus

      return matchesSearch && matchesStatus
    })

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'starred':
          if (a.is_starred !== b.is_starred) {
            return a.is_starred ? -1 : 1
          }
          return b.priority - a.priority
        case 'priority':
          return b.priority - a.priority
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'status':
          const statusOrder = { 'doing': 0, 'not_started': 1, 'blocked': 2, 'paused': 3, 'done': 4 }
          return statusOrder[a.status] - statusOrder[b.status]
        default:
          return 0
      }
    })

    setFilteredTasks(filtered)
  }, [tasks, searchTerm, filterStatus, sortBy])

  const toggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks)
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      newSelected.add(taskId)
    }
    setSelectedTasks(newSelected)
  }

  const toggleStarred = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const updatedTask = { ...task, is_starred: !task.is_starred }
    setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t))
    
    if (onTaskUpdate) {
      onTaskUpdate(taskId, { is_starred: updatedTask.is_starred })
    }
  }

  const promoteToMIT = async () => {
    const updates = Array.from(selectedTasks).map(async (taskId) => {
      const updatedTask = { is_mit: true }
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_mit: true } : t))
      
      if (onTaskUpdate) {
        onTaskUpdate(taskId, updatedTask)
      }
    })

    await Promise.all(updates)
    setSelectedTasks(new Set())
  }

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    
    if (onTaskUpdate) {
      onTaskUpdate(taskId, { status: newStatus })
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
  }

  const handleSaveTask = async (taskId: string, updates: Partial<Task>) => {
    // Update local state optimistically
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t))
    
    if (onTaskUpdate) {
      await onTaskUpdate(taskId, updates)
    }
    
    // Refresh tasks to get latest data
    fetchTasks()
  }

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'done': return '✅'
      case 'doing': return '🔄'
      case 'blocked': return '🚫'
      case 'paused': return '⏸️'
      default: return '⏳'
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'done': return 'text-green-600 bg-green-50 border-green-200'
      case 'doing': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'blocked': return 'text-red-600 bg-red-50 border-red-200'
      case 'paused': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-slate-600 bg-slate-50 border-slate-200'
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 5) return 'bg-red-500'
    if (priority >= 4) return 'bg-orange-500'
    if (priority >= 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  // Keyboard navigation - placed after function declarations
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'Enter' && e.ctrlKey && selectedTasks.size > 0) {
        promoteToMIT()
      } else if (e.key === 'a' && e.ctrlKey) {
        e.preventDefault()
        // Select all visible tasks
        setSelectedTasks(new Set(filteredTasks.map(t => t.id)))
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, selectedTasks.size, filteredTasks])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">📋 Task Manager</h2>
            <p className="text-sm text-slate-500 mt-1">
              {filteredTasks.length} of {tasks.length} tasks • {selectedTasks.size} selected
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Esc: Close • Ctrl+A: Select All • Ctrl+Enter: Promote to MIT
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl"
            aria-label="Close task manager"
          >
            ✕
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-slate-200 space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search tasks, descriptions, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="doing">In Progress</option>
              <option value="blocked">Blocked</option>
              <option value="paused">Paused</option>
              <option value="done">Completed</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="starred">⭐ Starred First</option>
              <option value="priority">🔥 Priority</option>
              <option value="status">📊 Status</option>
              <option value="created_at">📅 Recently Added</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedTasks.size > 0 && (
            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-700">
                {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={promoteToMIT}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                ⭐ Promote to MIT
              </button>
              <button
                onClick={() => setSelectedTasks(new Set())}
                className="px-3 py-1 bg-slate-200 text-slate-700 text-sm rounded hover:bg-slate-300 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin text-4xl">⏳</div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center text-slate-500 mt-8">
              <div className="text-4xl mb-4">📝</div>
              <div className="text-lg font-medium">No tasks found</div>
              <div className="text-sm">Try adjusting your search or filters</div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`border-2 rounded-lg transition-all ${
                    selectedTasks.has(task.id) ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'
                  } ${task.is_starred ? 'ring-2 ring-yellow-200' : ''}`}
                >
                  {/* Task Row */}
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedTasks.has(task.id)}
                        onChange={() => toggleTaskSelection(task.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        aria-label={`Select task: ${task.title}`}
                      />

                      {/* Star */}
                      <button
                        onClick={() => toggleStarred(task.id)}
                        className={`text-lg transition-colors ${
                          task.is_starred ? 'text-yellow-500 hover:text-yellow-600' : 'text-slate-300 hover:text-yellow-500'
                        }`}
                        aria-label={task.is_starred ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        ⭐
                      </button>

                      {/* Priority Indicator */}
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} title={`Priority: ${task.priority}`}></div>

                      {/* Task Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 
                                className={`font-medium cursor-pointer hover:text-blue-600 transition-colors ${
                                  task.status === 'done' ? 'line-through text-slate-500' : 'text-slate-800'
                                }`}
                                onClick={() => handleEditTask(task)}
                                title="Click to edit task"
                              >
                                {task.title}
                              </h3>
                              <button
                                onClick={() => handleEditTask(task)}
                                className="text-slate-400 hover:text-blue-600 text-sm"
                                title="Edit task"
                              >
                                ✏️
                              </button>
                              {task.is_mit && <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">MIT</span>}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                              {task.project && <span>📁 {task.project}</span>}
                              {task.estimated_minutes && <span>⏱️ {task.estimated_minutes}m</span>}
                              {task.due_date && <span>📅 {new Date(task.due_date).toLocaleDateString()}</span>}
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                            {getStatusIcon(task.status)} {task.status.replace('_', ' ')}
                          </div>

                          {/* Expand Button */}
                          <button
                            onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                            className="ml-2 text-slate-400 hover:text-slate-600"
                            aria-label="Toggle task details"
                          >
                            {expandedTask === task.id ? '▼' : '▶'}
                          </button>
                        </div>

                        {/* Tags */}
                        {task.tags.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {task.tags.map((tag) => (
                              <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedTask === task.id && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-slate-800 mb-2">Description</h4>
                            <p className="text-sm text-slate-600">
                              {task.description || 'No description provided'}
                            </p>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                              <select
                                value={task.status}
                                onChange={(e) => updateTaskStatus(task.id, e.target.value as Task['status'])}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="not_started">Not Started</option>
                                <option value="doing">In Progress</option>
                                <option value="blocked">Blocked</option>
                                <option value="paused">Paused</option>
                                <option value="done">Completed</option>
                              </select>
                            </div>
                            <div className="text-xs text-slate-500">
                              Created: {new Date(task.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Edit Modal */}
      <TaskEditModal
        task={editingTask}
        isOpen={editingTask !== null}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveTask}
      />
    </div>
  )
}