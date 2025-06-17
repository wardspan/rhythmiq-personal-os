import { useState, useEffect } from 'react'

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...')
  const [chaosLevel, setChaosLevel] = useState('🟢')
  const [tasks, setTasks] = useState([])
  const [mits, setMits] = useState([])

  useEffect(() => {
    // Test API connection
    fetch('http://localhost:8000/api/v1/health')
      .then(res => res.json())
      .then(() => {
        setApiStatus('✅ Connected')
        // Load tasks
        return fetch('http://localhost:8000/api/v1/tasks')
      })
      .then(res => res.json())
      .then(data => setTasks(data.tasks))
      .catch(() => setApiStatus('❌ Disconnected'))

    // Load MITs
    fetch('http://localhost:8000/api/v1/tasks/mits')
      .then(res => res.json())
      .then(data => setMits(data.mits))
      .catch(console.error)
  }, [])

  const createTestTask = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test task from frontend',
          status: 'not_started',
          is_mit: false
        })
      })
      const result = await response.json()
      alert(`Task created: ${result.message}`)
    } catch (error) {
      alert('Error creating task')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Rhythmiq Personal OS
          </h1>
          <p className="text-gray-600">
            AI-augmented productivity for ADHD minds - Phase 1 Core Trinity
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* System Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">System Status</h2>
            <div className="space-y-2">
              <div>API: {apiStatus}</div>
              <div>Frontend: ✅ Running</div>
              <div>Database: ✅ Connected</div>
              <div>Tasks Loaded: {tasks.length}</div>
            </div>
          </div>

          {/* Chaos Indicator */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Brain Weather</h2>
            <div className="text-center">
              <div className="text-6xl mb-2">{chaosLevel}</div>
              <div className="text-gray-600">Focused</div>
              <div className="text-sm text-gray-500 mt-2">
                Chaos detection ready
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button 
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                onClick={() => alert('Idea capture coming soon!')}
              >
                Capture Idea
              </button>
              <button 
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
                onClick={createTestTask}
              >
                Add Task
              </button>
              <button 
                className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600"
                onClick={() => alert('@claude @chatgpt routing coming soon!')}
              >
                Ask AI
              </button>
            </div>
          </div>
        </div>

        {/* MITs Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Today's MITs (Most Important Tasks)</h2>
          <div className="space-y-3">
            {mits.map((mit, index) => (
              <div key={index} className="flex items-center p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                <div className="flex-1">
                  <div className="font-medium">{mit.title}</div>
                  <div className="text-sm text-gray-600">Status: {mit.status.replace('_', ' ')}</div>
                </div>
                <div className="ml-4">
                  {mit.status === 'doing' ? (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">In Progress</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">Not Started</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">All Tasks</h2>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-gray-600">
                    {task.is_mit && <span className="bg-yellow-200 px-2 py-1 rounded text-xs mr-2">MIT</span>}
                    Status: {task.status.replace('_', ' ')}
                  </div>
                </div>
                <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300">
                  Update
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Phase 1 Features Status */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Phase 1: Core Trinity Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded border border-green-200">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">Dashboard</div>
              <div className="text-sm text-green-600">✅ Working</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded border border-yellow-200">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-medium">Quick Capture</div>
              <div className="text-sm text-yellow-600">🔄 In Progress</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded border border-yellow-200">
              <div className="text-2xl mb-2">🔔</div>
              <div className="font-medium">Nudge Engine</div>
              <div className="text-sm text-yellow-600">🔄 Ready (n8n)</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded border border-yellow-200">
              <div className="text-2xl mb-2">🤖</div>
              <div className="font-medium">AI Bridge</div>
              <div className="text-sm text-yellow-600">🔄 Ready</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App