import { useState, useEffect } from 'react'
import type {
  WhoopHealthData,
  WhoopStatus,
  WhoopRecoveryData,
  WhoopSleepData,
  WhoopWorkoutData,
  WhoopADHDInsights,
  WhoopConnectionConfig
} from '../types/whoop'

const API_BASE = 'http://localhost:8000/api/v1'

export function useWhoopHealth(refreshInterval: number = 300000) { // 5 minutes
  const [data, setData] = useState<WhoopHealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const response = await fetch(`${API_BASE}/whoop/health`)
        if (!response.ok) throw new Error('Failed to fetch health data')
        const healthData = await response.json()
        setData(healthData)
        setError(null)
      } catch (err) {
        console.error('Error fetching WHOOP health data:', err)
        setError('Failed to load health data')
      } finally {
        setLoading(false)
      }
    }

    fetchHealthData()
    const interval = setInterval(fetchHealthData, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  return { data, loading, error, refetch: () => setLoading(true) }
}

export function useWhoopStatus() {
  const [data, setData] = useState<WhoopStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/whoop/status`)
        if (!response.ok) throw new Error('Failed to fetch status')
        const status = await response.json()
        setData(status)
        setError(null)
      } catch (err) {
        console.error('Error fetching WHOOP status:', err)
        setError('Failed to load status')
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [])

  return { data, loading, error, refetch: () => setLoading(true) }
}

export function useWhoopRecovery(days: number = 7) {
  const [data, setData] = useState<WhoopRecoveryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecovery = async () => {
      try {
        const response = await fetch(`${API_BASE}/whoop/recovery?days=${days}`)
        if (!response.ok) throw new Error('Failed to fetch recovery data')
        const recoveryData = await response.json()
        setData(recoveryData)
        setError(null)
      } catch (err) {
        console.error('Error fetching WHOOP recovery data:', err)
        setError('Failed to load recovery data')
      } finally {
        setLoading(false)
      }
    }

    fetchRecovery()
  }, [days])

  return { data, loading, error, refetch: () => setLoading(true) }
}

export function useWhoopSleep(days: number = 7) {
  const [data, setData] = useState<WhoopSleepData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSleep = async () => {
      try {
        const response = await fetch(`${API_BASE}/whoop/sleep?days=${days}`)
        if (!response.ok) throw new Error('Failed to fetch sleep data')
        const sleepData = await response.json()
        setData(sleepData)
        setError(null)
      } catch (err) {
        console.error('Error fetching WHOOP sleep data:', err)
        setError('Failed to load sleep data')
      } finally {
        setLoading(false)
      }
    }

    fetchSleep()
  }, [days])

  return { data, loading, error, refetch: () => setLoading(true) }
}

export function useWhoopWorkouts(days: number = 7) {
  const [data, setData] = useState<WhoopWorkoutData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await fetch(`${API_BASE}/whoop/workouts?days=${days}`)
        if (!response.ok) throw new Error('Failed to fetch workout data')
        const workoutData = await response.json()
        setData(workoutData)
        setError(null)
      } catch (err) {
        console.error('Error fetching WHOOP workout data:', err)
        setError('Failed to load workout data')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkouts()
  }, [days])

  return { data, loading, error, refetch: () => setLoading(true) }
}

export function useWhoopADHDInsights(days: number = 30) {
  const [data, setData] = useState<WhoopADHDInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch(`${API_BASE}/whoop/correlations/adhd?days=${days}`)
        if (!response.ok) throw new Error('Failed to fetch ADHD insights')
        const insights = await response.json()
        setData(insights)
        setError(null)
      } catch (err) {
        console.error('Error fetching WHOOP ADHD insights:', err)
        setError('Failed to load insights')
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [days])

  return { data, loading, error, refetch: () => setLoading(true) }
}

export function useWhoopConnection() {
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connect = async () => {
    setConnecting(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE}/whoop/connect`)
      if (!response.ok) throw new Error('Failed to initiate connection')
      const { auth_url } = await response.json()
      
      // Redirect to WHOOP OAuth
      window.location.href = auth_url
    } catch (err) {
      console.error('Error connecting to WHOOP:', err)
      setError('Failed to connect to WHOOP')
      setConnecting(false)
    }
  }

  const disconnect = async () => {
    setDisconnecting(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE}/whoop/disconnect`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to disconnect')
      
      // Refresh the page to update status
      window.location.reload()
    } catch (err) {
      console.error('Error disconnecting from WHOOP:', err)
      setError('Failed to disconnect from WHOOP')
    } finally {
      setDisconnecting(false)
    }
  }

  const syncData = async (days: number = 7) => {
    try {
      const response = await fetch(`${API_BASE}/whoop/sync?days=${days}`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to sync data')
      
      return await response.json()
    } catch (err) {
      console.error('Error syncing WHOOP data:', err)
      throw new Error('Failed to sync WHOOP data')
    }
  }

  return {
    connect,
    disconnect,
    syncData,
    connecting,
    disconnecting,
    error
  }
}