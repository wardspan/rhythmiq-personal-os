import React, { useState } from 'react'
import IdeaEditModal from './IdeaEditModal'

export default function ActionButtons() {
  const [showCaptureModal, setShowCaptureModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [captureText, setCaptureText] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskPriority, setTaskPriority] = useState(3)
  const [estimatedMinutes, setEstimatedMinutes] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [isMit, setIsMit] = useState(false)
  const [taskTags, setTaskTags] = useState('')
  const [taskValidation, setTaskValidation] = useState({
    isSpecific: false,
    isMeasurable: false,
    isTimeBound: false
  })
  const [recentIdeas, setRecentIdeas] = useState<any[]>([])
  const [editingIdea, setEditingIdea] = useState<any>(null)

  const handleCapture = async () => {
    if (!captureText.trim()) return
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: captureText,
          type: 'quick_capture'
        })
      })
      
      if (response.ok) {
        setCaptureText('')
        setShowCaptureModal(false)
        // Show success feedback
        console.log('Idea captured successfully')
        // Refresh recent ideas
        fetchRecentIdeas()
      }
    } catch (error) {
      console.error('Error capturing idea:', error)
    }
  }

  const validateTask = (title: string, description: string, estimatedMinutes: string, dueDate: string) => {
    const isSpecific = title.length >= 10 && description.length >= 5
    const isMeasurable = estimatedMinutes !== '' || description.toLowerCase().includes('complete') || description.toLowerCase().includes('finish')
    const isTimeBound = dueDate !== '' || estimatedMinutes !== ''
    
    return { isSpecific, isMeasurable, isTimeBound }
  }

  const handleAddTask = async () => {
    if (!taskTitle.trim()) return
    
    const validation = validateTask(taskTitle, taskDescription, estimatedMinutes, dueDate)
    setTaskValidation(validation)
    
    // Require SMART criteria for task creation
    if (!validation.isSpecific || !validation.isMeasurable || !validation.isTimeBound) {
      return // Don't submit if not SMART
    }
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          priority: taskPriority,
          estimated_minutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
          due_date: dueDate || null,
          is_mit: isMit,
          tags: taskTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
          status: 'not_started'
        })
      })
      
      if (response.ok) {
        // Reset all form fields
        setTaskTitle('')
        setTaskDescription('')
        setTaskPriority(3)
        setEstimatedMinutes('')
        setDueDate('')
        setIsMit(false)
        setTaskTags('')
        setTaskValidation({ isSpecific: false, isMeasurable: false, isTimeBound: false })
        setShowTaskModal(false)
        console.log('Task created successfully')
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const fetchRecentIdeas = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/ideas?limit=5')
      if (response.ok) {
        const data = await response.json()
        setRecentIdeas(data)
      }
    } catch (error) {
      console.error('Error fetching ideas:', error)
    }
  }

  const handleIdeaEdit = (idea: any) => {
    setEditingIdea(idea)
  }

  const handleIdeaSave = async (ideaId: string, updates: any) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/ideas/${ideaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        fetchRecentIdeas()
        console.log('Idea updated successfully')
      }
    } catch (error) {
      console.error('Error updating idea:', error)
    }
  }

  // Fetch recent ideas when capture modal opens
  React.useEffect(() => {
    if (showCaptureModal) {
      fetchRecentIdeas()
    }
  }, [showCaptureModal])


  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Capture Button - Idea Pool */}
          <button
            onClick={() => setShowCaptureModal(true)}
            className="flex items-center justify-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-all group border-2 border-blue-200 hover:border-blue-300"
          >
            <div className="text-2xl group-hover:scale-110 transition-transform">💡</div>
            <div className="text-left">
              <div className="font-medium">Quick Capture</div>
              <div className="text-sm opacity-75">Idea Pool • Frictionless</div>
            </div>
          </button>

          {/* Add Task Button - Structured */}
          <button
            onClick={() => setShowTaskModal(true)}
            className="flex items-center justify-center gap-3 p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-all group border-2 border-green-200 hover:border-green-300"
          >
            <div className="text-2xl group-hover:scale-110 transition-transform">🎯</div>
            <div className="text-left">
              <div className="font-medium">Create Task</div>
              <div className="text-sm opacity-75">SMART • Structured</div>
            </div>
          </button>
        </div>
      </div>

      {/* Capture Modal */}
      {showCaptureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-slate-800">💡 Idea Pool - Quick Capture</h3>
                <p className="text-sm text-slate-500">Frictionless capture for any thought or inspiration</p>
              </div>
              <button
                onClick={() => setShowCaptureModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            
            <textarea
              value={captureText}
              onChange={(e) => setCaptureText(e.target.value)}
              placeholder="What's on your mind? Capture any idea, thought, observation, or inspiration... No structure needed!"
              className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              autoFocus
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowCaptureModal(false)}
                className="flex-1 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCapture}
                disabled={!captureText.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                Capture
              </button>
            </div>

            {/* Recent Ideas */}
            {recentIdeas.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200">
                <h4 className="text-sm font-medium text-slate-700 mb-3">Recent Ideas</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {recentIdeas.map((idea) => (
                    <div key={idea.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800 truncate">{idea.title}</div>
                        <div className="text-xs text-slate-500">{new Date(idea.created_at).toLocaleDateString()}</div>
                      </div>
                      <button
                        onClick={() => handleIdeaEdit(idea)}
                        className="ml-2 text-slate-400 hover:text-blue-600 text-sm"
                        title="Edit idea"
                      >
                        ✏️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-slate-800">🎯 Create Structured Task</h3>
                <p className="text-sm text-slate-500">SMART goals: Specific, Measurable, Achievable, Relevant, Time-bound</p>
              </div>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* SMART Validation Indicators */}
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <div className="text-xs font-medium text-slate-700 mb-2">SMART Criteria</div>
              <div className="flex gap-4 text-xs">
                <div className={`flex items-center gap-1 ${taskValidation.isSpecific ? 'text-green-600' : 'text-slate-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${taskValidation.isSpecific ? 'bg-green-400' : 'bg-slate-300'}`}></div>
                  Specific
                </div>
                <div className={`flex items-center gap-1 ${taskValidation.isMeasurable ? 'text-green-600' : 'text-slate-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${taskValidation.isMeasurable ? 'bg-green-400' : 'bg-slate-300'}`}></div>
                  Measurable
                </div>
                <div className={`flex items-center gap-1 ${taskValidation.isTimeBound ? 'text-green-600' : 'text-slate-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${taskValidation.isTimeBound ? 'bg-green-400' : 'bg-slate-300'}`}></div>
                  Time-bound
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Task Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Task Title* <span className="text-xs text-slate-500">(min 10 chars for specificity)</span>
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => {
                    setTaskTitle(e.target.value)
                    setTaskValidation(validateTask(e.target.value, taskDescription, estimatedMinutes, dueDate))
                  }}
                  placeholder="e.g., 'Complete user authentication wireframes for mobile app'"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  autoFocus
                />
              </div>

              {/* Task Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description* <span className="text-xs text-slate-500">(define success criteria)</span>
                </label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => {
                    setTaskDescription(e.target.value)
                    setTaskValidation(validateTask(taskTitle, e.target.value, estimatedMinutes, dueDate))
                  }}
                  placeholder="What exactly needs to be completed? How will you know it's done?"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Estimated Time */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Est. Minutes*
                  </label>
                  <input
                    type="number"
                    value={estimatedMinutes}
                    onChange={(e) => {
                      setEstimatedMinutes(e.target.value)
                      setTaskValidation(validateTask(taskTitle, taskDescription, e.target.value, dueDate))
                    }}
                    placeholder="30"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => {
                      setDueDate(e.target.value)
                      setTaskValidation(validateTask(taskTitle, taskDescription, estimatedMinutes, e.target.value))
                    }}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(Number(e.target.value))}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value={1}>Low (1)</option>
                    <option value={2}>Low-Medium (2)</option>
                    <option value={3}>Medium (3)</option>
                    <option value={4}>Medium-High (4)</option>
                    <option value={5}>High (5)</option>
                  </select>
                </div>

                {/* MIT Toggle */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Task Type
                  </label>
                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="checkbox"
                      id="isMit"
                      checked={isMit}
                      onChange={(e) => setIsMit(e.target.checked)}
                      className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="isMit" className="text-sm text-slate-700">
                      Most Important Task (MIT)
                    </label>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tags <span className="text-xs text-slate-500">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={taskTags}
                  onChange={(e) => setTaskTags(e.target.value)}
                  placeholder="project-alpha, design, urgent"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTaskModal(false)}
                className="flex-1 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                disabled={!taskValidation.isSpecific || !taskValidation.isMeasurable || !taskValidation.isTimeBound}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                {taskValidation.isSpecific && taskValidation.isMeasurable && taskValidation.isTimeBound 
                  ? 'Create Task' 
                  : 'Complete SMART Criteria'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Idea Edit Modal */}
      <IdeaEditModal
        idea={editingIdea}
        isOpen={editingIdea !== null}
        onClose={() => setEditingIdea(null)}
        onSave={handleIdeaSave}
      />
    </>
  )
}