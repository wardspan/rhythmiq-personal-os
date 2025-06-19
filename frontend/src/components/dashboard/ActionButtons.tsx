import React, { useState } from 'react'

export default function ActionButtons() {
  const [showCaptureModal, setShowCaptureModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [captureText, setCaptureText] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskPriority, setTaskPriority] = useState(3)

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
      }
    } catch (error) {
      console.error('Error capturing idea:', error)
    }
  }

  const handleAddTask = async () => {
    if (!taskTitle.trim()) return
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          priority: taskPriority,
          status: 'not_started'
        })
      })
      
      if (response.ok) {
        setTaskTitle('')
        setTaskPriority(3)
        setShowTaskModal(false)
        // Show success feedback
        console.log('Task added successfully')
      }
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }


  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Capture Button */}
          <button
            onClick={() => setShowCaptureModal(true)}
            className="flex items-center justify-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors group"
          >
            <div className="text-2xl group-hover:scale-110 transition-transform">📝</div>
            <div>
              <div className="font-medium">Quick Capture</div>
              <div className="text-sm opacity-75">Capture ideas instantly</div>
            </div>
          </button>

          {/* Add Task Button */}
          <button
            onClick={() => setShowTaskModal(true)}
            className="flex items-center justify-center gap-3 p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-colors group"
          >
            <div className="text-2xl group-hover:scale-110 transition-transform">✅</div>
            <div>
              <div className="font-medium">Add Task</div>
              <div className="text-sm opacity-75">Create new tasks</div>
            </div>
          </button>
        </div>
      </div>

      {/* Capture Modal */}
      {showCaptureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-800">Quick Capture</h3>
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
              placeholder="What's on your mind? Capture any idea, thought, or note..."
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
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-800">Add New Task</h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  autoFocus
                />
              </div>
              
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
                disabled={!taskTitle.trim()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}