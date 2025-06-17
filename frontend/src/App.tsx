import { useState, useEffect } from 'react'
import WeatherWidget from './components/dashboard/WeatherWidget'
import SystemStatusFooter from './components/dashboard/SystemStatusFooter'

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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-3xl font-light text-slate-800 mb-3">
            Rhythmiq
          </h1>
          <p className="text-slate-600 text-lg">
            Your Personal Operating System
          </p>
        </header>

        {/* Top Row: Brain Weather + Weather */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Brain Weather */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="text-7xl mb-4">{chaosLevel}</div>
            <div className="text-xl text-slate-700 font-medium">Focused</div>
            <div className="text-sm text-slate-500 mt-2">All systems calm</div>
          </div>

          {/* Weather Widget */}
          <WeatherWidget />
        </div>

        {/* MITs - Clean Focus */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-xl font-medium text-slate-800 mb-6">Today's Focus</h2>
          <div className="space-y-4">
            {mits.map((mit, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{mit.title}</div>
                  <div className="text-sm text-slate-500 mt-1">
                    {mit.status === 'doing' ? '🔄 In Progress' : '⏸️ Not Started'}
                  </div>
                </div>
                <div className="ml-4">
                  <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions - Simplified */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-xl transition-colors font-medium"
            onClick={() => alert('Idea capture coming soon!')}
          >
            💡 Capture
          </button>
          <button 
            className="bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl transition-colors font-medium"
            onClick={createTestTask}
          >
            ✅ Add Task
          </button>
          <button 
            className="bg-purple-500 hover:bg-purple-600 text-white py-4 px-6 rounded-xl transition-colors font-medium"
            onClick={() => alert('@claude @chatgpt routing coming soon!')}
          >
            🤖 Ask AI
          </button>
        </div>

        {/* All Tasks - Clean List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-medium text-slate-800 mb-6">All Tasks</h2>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div>
                    <div className="font-medium text-slate-800">{task.title}</div>
                    <div className="text-sm text-slate-500">
                      {task.is_mit && <span className="text-amber-600">⭐ MIT</span>}
                    </div>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status Footer */}
      <SystemStatusFooter />
    </div>
  )
}

export default App