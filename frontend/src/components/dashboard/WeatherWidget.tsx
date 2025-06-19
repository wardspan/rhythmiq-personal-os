import { useState, useEffect } from 'react'
import { useWhoopHealth } from '../../hooks/useWhoop'

interface WeatherData {
    temperature: number
    description: string  // Changed from 'condition'
    humidity: number
    pressure: number
    wind_speed: number   // Changed from 'windSpeed'
    location: string
    weather_icon: string // Changed from 'icon'
    feels_like: number   // Changed from 'feelsLike'
    air_quality_impact: string // Added new field
  }

function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: health } = useWhoopHealth()

  useEffect(() => {
    let isMounted = true
    
    const fetchWeather = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout
        
        const response = await fetch('http://localhost:8000/api/v1/weather/current', {
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        if (!response.ok) throw new Error('Weather fetch failed')
        const data = await response.json()
        
        if (isMounted) {
          setWeather(data)
          setLoading(false)
          setError(null)
        }
      } catch (err) {
        console.error('Weather fetch error:', err)
        if (isMounted) {
          setError('Failed to load weather')
          setLoading(false)
        }
      }
    }

    fetchWeather()
    
    // Refresh every 10 minutes to match backend cache
    const interval = setInterval(fetchWeather, 10 * 60 * 1000)
    
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
          <div className="h-12 bg-slate-200 rounded w-3/4 mb-3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded w-full"></div>
            <div className="h-3 bg-slate-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="text-center text-slate-500">
          <div className="text-2xl mb-2">🌐</div>
          <div className="text-sm">Weather unavailable</div>
        </div>
      </div>
    )
  }

  // Use the new air_quality_impact from API instead of local calculation
  const getImpactDisplay = (impact: string) => {
    if (impact.includes('Poor') || impact.includes('High UV')) {
      return { level: '🔴', text: impact, color: 'text-red-600' }
    }
    if (impact.includes('May affect') || impact.includes('Moderate') || impact.includes('Good air quality')) {
      return { level: '🟡', text: impact, color: 'text-yellow-600' }
    }
    if (impact.includes('Excellent') || impact.includes('Good for')) {
      return { level: '🟢', text: impact, color: 'text-green-600' }
    }
    return { level: '⚪', text: impact, color: 'text-slate-500' }
  }

  const impactDisplay = getImpactDisplay(weather.air_quality_impact)

  // Get health-based weather sensitivity insights
  const getHealthWeatherInsights = () => {
    if (!health || !health.whoop_connected) return null

    const recovery = health.recovery_score || 0
    const sleep = health.sleep_quality || 0
    const temp = weather.temperature

    // Low recovery makes people more sensitive to weather changes
    if (recovery < 50) {
      if (temp < 45 || temp > 85) {
        return {
          icon: '⚠️',
          message: 'Weather may impact focus more when recovery is low',
          suggestion: 'Consider indoor activities and stay hydrated',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50'
        }
      }
    }

    // Good recovery with good weather
    if (recovery >= 70 && temp >= 60 && temp <= 75 && !weather.description.toLowerCase().includes('rain')) {
      return {
        icon: '🌟',
        message: 'Great conditions for outdoor activities',
        suggestion: 'Perfect weather to complement your good recovery',
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      }
    }

    // Poor sleep quality makes weather changes more noticeable
    if (sleep < 50 && (weather.humidity > 70 || weather.pressure < 29.5)) {
      return {
        icon: '💤',
        message: 'High humidity/low pressure may worsen fatigue',
        suggestion: 'Extra rest breaks recommended today',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      }
    }

    return null
  }

  const healthInsight = getHealthWeatherInsights()

  // Convert weather icon code to emoji (simple mapping)
  const getWeatherEmoji = (iconCode: string) => {
    const iconMap: { [key: string]: string } = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    }
    return iconMap[iconCode] || '🌤️'
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-800">Weather</h3>
        <div className="text-xs text-slate-500">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Main Weather Display */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-4xl">{getWeatherEmoji(weather.weather_icon)}</div>
          <div>
            <div className="text-2xl font-light text-slate-800">
              {weather.temperature}°F
            </div>
            <div className="text-sm text-slate-600">
              Feels like {weather.feels_like}°F
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-slate-700">{weather.description}</div>
          <div className="text-xs text-slate-500">{weather.location}</div>
        </div>
      </div>

      {/* Detailed Conditions */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
        <div className="bg-slate-50 rounded-lg p-2">
          <div className="text-xs text-slate-500">Humidity</div>
          <div className="text-sm font-medium text-slate-700">{weather.humidity}%</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <div className="text-xs text-slate-500">Pressure</div>
          <div className="text-sm font-medium text-slate-700">{weather.pressure}"</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <div className="text-xs text-slate-500">Wind</div>
          <div className="text-sm font-medium text-slate-700">{weather.wind_speed} mph</div>
        </div>
      </div>

      {/* Health-Based Weather Insights */}
      {healthInsight && (
        <div className={`${healthInsight.bgColor} rounded-lg p-3 mb-3`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{healthInsight.icon}</span>
            <span className={`text-xs font-medium ${healthInsight.color}`}>
              Health + Weather Insight
            </span>
          </div>
          <div className="text-xs text-slate-700 mb-1">{healthInsight.message}</div>
          <div className="text-xs text-slate-600">{healthInsight.suggestion}</div>
        </div>
      )}

      {/* Enhanced Cognitive Impact Indicator */}
      <div className="border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm">{impactDisplay.level}</span>
            <span className={`text-xs ${impactDisplay.color}`}>
              {impactDisplay.text}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {health?.whoop_connected && (
              <div className="text-xs text-slate-400">
                Recovery: {health.recovery_score || '--'}%
              </div>
            )}
            <button className="text-xs text-slate-400 hover:text-slate-600">
              Why?
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeatherWidget