import React, { useState, useEffect, useCallback } from 'react'

interface Task {
  id: string
  title: string
  description?: string
  status: 'not_started' | 'doing' | 'done' | 'blocked' | 'paused'
  priority: number
  is_mit: boolean
  is_starred?: boolean
  estimated_minutes?: number
  actual_minutes?: number
  due_date?: string
  tags: string[]
  project?: string
  created_at: string
  updated_at?: string
}

interface TaskEditModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSave: (taskId: string, updates: Partial<Task>) => Promise<void>
}

export default function TaskEditModal({ task, isOpen, onClose, onSave }: TaskEditModalProps) {
  const [formData, setFormData] = useState<Partial<Task>>({})
  const [originalData, setOriginalData] = useState<Partial<Task>>({})
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showConfirmClose, setShowConfirmClose] = useState(false)

  // Initialize form data when task changes
  useEffect(() => {
    if (task && isOpen) {
      const initialData = {
        title: task.title || '',
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        is_mit: task.is_mit,
        is_starred: task.is_starred || false,
        estimated_minutes: task.estimated_minutes?.toString() || '',
        actual_minutes: task.actual_minutes?.toString() || '',
        due_date: task.due_date ? task.due_date.split('T')[0] : '', // Extract date part
        tags: task.tags || [],
        project: task.project || ''
      }
      setFormData(initialData)
      setOriginalData(initialData)
      setIsDirty(false)
      setErrors({})
    }
  }, [task, isOpen])

  // Track changes
  useEffect(() => {
    if (task && Object.keys(originalData).length > 0) {
      const hasChanges = Object.keys(formData).some(key => {
        const current = formData[key as keyof typeof formData]
        const original = originalData[key as keyof typeof originalData]
        return JSON.stringify(current) !== JSON.stringify(original)
      })
      setIsDirty(hasChanges)
    }
  }, [formData, originalData, task])

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleSave()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isDirty])

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }

    if (formData.estimated_minutes && (formData.estimated_minutes < 1 || formData.estimated_minutes > 1440)) {
      newErrors.estimated_minutes = 'Estimated minutes must be between 1 and 1440 (24 hours)'
    }

    if (formData.actual_minutes && (formData.actual_minutes < 1 || formData.actual_minutes > 1440)) {
      newErrors.actual_minutes = 'Actual minutes must be between 1 and 1440 (24 hours)'
    }

    if (formData.due_date && new Date(formData.due_date) < new Date(new Date().setHours(0, 0, 0, 0))) {
      newErrors.due_date = 'Due date cannot be in the past'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    setFormData(prev => ({ ...prev, tags }))
  }

  const handleSave = async () => {
    if (!task || !validateForm()) return

    setIsSaving(true)
    try {
      // Process form data for API
      const updates = {
        ...formData,
        estimated_minutes: formData.estimated_minutes ? Number(formData.estimated_minutes) : undefined,
        actual_minutes: formData.actual_minutes ? Number(formData.actual_minutes) : undefined,
        due_date: formData.due_date || undefined
      }

      await onSave(task.id, updates)
      setIsDirty(false)
      onClose()
    } catch (error) {
      console.error('Error saving task:', error)
      setErrors({ general: 'Failed to save task. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (isDirty) {
      setShowConfirmClose(true)
    } else {
      onClose()
    }
  }

  const confirmClose = () => {
    setShowConfirmClose(false)
    setIsDirty(false)
    onClose()
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

  if (!isOpen || !task) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-800">✏️ Edit Task</h2>
              <p className="text-sm text-slate-500 mt-1">
                {isDirty ? 'Unsaved changes' : 'No changes'} • Ctrl+S to save • Esc to close
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 text-xl"
              aria-label="Close edit modal"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {errors.general}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="Enter task title..."
                autoFocus
              />
              {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                placeholder="Describe what needs to be done..."
              />
            </div>

            {/* Status and Priority Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as Task['status'])}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="not_started">⏳ Not Started</option>
                    <option value="doing">🔄 In Progress</option>
                    <option value="blocked">🚫 Blocked</option>
                    <option value="paused">⏸️ Paused</option>
                    <option value="done">✅ Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', Number(e.target.value))}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 - Low</option>
                  <option value={2}>2 - Low-Medium</option>
                  <option value={3}>3 - Medium</option>
                  <option value={4}>4 - Medium-High</option>
                  <option value={5}>5 - High</option>
                </select>
              </div>
            </div>

            {/* Time Estimates Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Estimated Minutes
                </label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={formData.estimated_minutes || ''}
                  onChange={(e) => handleInputChange('estimated_minutes', e.target.value ? Number(e.target.value) : '')}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.estimated_minutes ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="e.g. 60"
                />
                {errors.estimated_minutes && <p className="text-red-600 text-xs mt-1">{errors.estimated_minutes}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Actual Minutes
                </label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={formData.actual_minutes || ''}
                  onChange={(e) => handleInputChange('actual_minutes', e.target.value ? Number(e.target.value) : '')}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.actual_minutes ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="e.g. 45"
                />
                {errors.actual_minutes && <p className="text-red-600 text-xs mt-1">{errors.actual_minutes}</p>}
              </div>
            </div>

            {/* Due Date and Project Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.due_date || ''}
                  onChange={(e) => handleInputChange('due_date', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.due_date ? 'border-red-300' : 'border-slate-300'
                  }`}
                />
                {errors.due_date && <p className="text-red-600 text-xs mt-1">{errors.due_date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project
                </label>
                <input
                  type="text"
                  value={formData.project || ''}
                  onChange={(e) => handleInputChange('project', e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Dashboard Enhancement"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tags <span className="text-slate-500">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) => handleTagsChange(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. urgent, design, frontend"
              />
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_mit || false}
                  onChange={(e) => handleInputChange('is_mit', e.target.checked)}
                  className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-slate-700">Most Important Task (MIT)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_starred || false}
                  onChange={(e) => handleInputChange('is_starred', e.target.checked)}
                  className="rounded border-slate-300 text-yellow-600 focus:ring-yellow-500"
                />
                <span className="text-sm text-slate-700">⭐ Starred/Favorite</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
            <div className="text-xs text-slate-500">
              Created: {new Date(task.created_at).toLocaleDateString()}
              {task.updated_at && (
                <span className="ml-3">
                  Last updated: {new Date(task.updated_at).toLocaleDateString()}
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isDirty || isSaving || Object.keys(errors).length > 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Close Dialog */}
      {showConfirmClose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-slate-800 mb-3">Unsaved Changes</h3>
            <p className="text-slate-600 mb-6">
              You have unsaved changes. Are you sure you want to close without saving?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmClose(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Continue Editing
              </button>
              <button
                onClick={confirmClose}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}