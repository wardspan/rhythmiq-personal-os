import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

export default function WhoopCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')

      if (error) {
        setStatus('error')
        setMessage(`WHOOP authorization failed: ${error}`)
        setTimeout(() => navigate('/'), 3000)
        return
      }

      if (!code || !state) {
        setStatus('error')
        setMessage('Missing authorization code or state parameter')
        setTimeout(() => navigate('/'), 3000)
        return
      }

      try {
        // Send the authorization code to our backend
        const response = await fetch(`http://localhost:8000/api/v1/whoop/callback?code=${code}&state=${state}`)
        
        if (response.ok) {
          setStatus('success')
          setMessage('WHOOP connected successfully!')
          setTimeout(() => navigate('/'), 2000)
        } else {
          const errorData = await response.json()
          setStatus('error')
          setMessage(`Failed to connect WHOOP: ${errorData.detail || 'Unknown error'}`)
          setTimeout(() => navigate('/'), 3000)
        }
      } catch (error) {
        console.error('Callback error:', error)
        setStatus('error')
        setMessage('Network error during WHOOP connection')
        setTimeout(() => navigate('/'), 3000)
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <h2 className="text-xl font-medium text-slate-800 mb-2">Connecting WHOOP...</h2>
            <p className="text-slate-600">Please wait while we complete your WHOOP connection.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-medium text-green-800 mb-2">Connection Successful!</h2>
            <p className="text-slate-600 mb-4">{message}</p>
            <p className="text-sm text-slate-500">Redirecting you back to the dashboard...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-medium text-red-800 mb-2">Connection Failed</h2>
            <p className="text-slate-600 mb-4">{message}</p>
            <p className="text-sm text-slate-500">Redirecting you back to the dashboard...</p>
          </>
        )}
      </div>
    </div>
  )
}