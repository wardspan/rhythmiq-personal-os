# backend/api/v1/endpoints/weather.py - Updated to use One Call API 3.0

from fastapi import APIRouter, HTTPException
import httpx
from datetime import datetime, timedelta
from typing import Optional
import logging
from core.config import get_settings

# Simple in-memory cache (use Redis in production)
weather_cache = {}
CACHE_DURATION_MINUTES = 10  # Cache for 10 minutes

router = APIRouter(prefix="/weather", tags=["weather"])
settings = get_settings()
logger = logging.getLogger(__name__)

@router.get("/current")
async def get_current_weather():
    """Get current weather with intelligent caching using One Call API 3.0"""
    
    if not settings.OPENWEATHER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenWeather API key not configured")
    
    cache_key = f"current_weather_{settings.DEFAULT_LOCATION.lower().replace(' ', '_').replace(',', '')}"
    now = datetime.utcnow()
    
    # Check if we have valid cached data
    if cache_key in weather_cache:
        cached_data = weather_cache[cache_key]
        cache_time = datetime.fromisoformat(cached_data["cached_at"])
        
        # Return cached data if less than 10 minutes old
        if now - cache_time < timedelta(minutes=CACHE_DURATION_MINUTES):
            logger.info("Returning cached weather data")
            return cached_data["data"]
    
    # Make API call only if no valid cache
    try:
        logger.info("Fetching fresh weather data from OpenWeather One Call API 3.0")
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://api.openweathermap.org/data/3.0/onecall",
                params={
                    "lat": settings.DEFAULT_LATITUDE,
                    "lon": settings.DEFAULT_LONGITUDE,
                    "exclude": "minutely,alerts",  # Exclude minutely forecasts and alerts to save data
                    "appid": settings.OPENWEATHER_API_KEY,
                    "units": "imperial"
                }
            )
            
        if response.status_code != 200:
            logger.error(f"OpenWeather One Call API error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=500, detail="Weather API unavailable")
            
        weather_data = response.json()
        
        # Extract current weather from One Call API response
        current = weather_data["current"]
        daily_forecast = weather_data["daily"][0] if weather_data.get("daily") else {}
        
        # Calculate air quality impact based on UV index and weather conditions
        uv_index = current.get("uvi", 0)
        weather_id = current["weather"][0]["id"]
        
        air_quality_impact = calculate_air_quality_impact(uv_index, weather_id)
        
        # Format response with richer data from One Call API
        formatted_data = {
            "temperature": round(current["temp"]),
            "feels_like": round(current["feels_like"]),
            "description": current["weather"][0]["description"].title(),
            "humidity": current["humidity"],
            "pressure": round(current["pressure"] * 0.02953, 2),  # Convert hPa to inHg
            "wind_speed": round(current.get("wind_speed", 0)),
            "wind_direction": current.get("wind_deg", 0),
            "uv_index": round(current.get("uvi", 0), 1),
            "visibility": round(current.get("visibility", 10000) * 0.000621371, 1),  # Convert m to miles
            "dew_point": round(current.get("dew_point", 0)),
            "clouds": current.get("clouds", 0),
            "sunrise": datetime.fromtimestamp(current["sunrise"]).strftime("%H:%M"),
            "sunset": datetime.fromtimestamp(current["sunset"]).strftime("%H:%M"),
            "daily_high": round(daily_forecast.get("temp", {}).get("max", current["temp"])),
            "daily_low": round(daily_forecast.get("temp", {}).get("min", current["temp"])),
            "location": settings.DEFAULT_LOCATION,
            "last_updated": now.isoformat(),
            "air_quality_impact": air_quality_impact,
            "weather_icon": current["weather"][0]["icon"]
        }
        
        # Cache the result
        weather_cache[cache_key] = {
            "data": formatted_data,
            "cached_at": now.isoformat()
        }
        
        logger.info(f"Weather data cached successfully for {settings.DEFAULT_LOCATION}")
        return formatted_data
        
    except httpx.TimeoutException:
        logger.error("OpenWeather One Call API timeout")
        # Return stale cache if available
        if cache_key in weather_cache:
            logger.warning("Returning stale cached data due to timeout")
            return weather_cache[cache_key]["data"]
        raise HTTPException(status_code=504, detail="Weather service timeout")
        
    except Exception as e:
        logger.error(f"Weather API error: {str(e)}")
        
        # Return stale cache if available during error
        if cache_key in weather_cache:
            logger.warning("Returning stale cached data due to API error")
            return weather_cache[cache_key]["data"]
            
        # Fallback data if no cache available
        return {
            "temperature": 72,
            "feels_like": 72,
            "description": "Weather data unavailable",
            "humidity": 50,
            "pressure": 30.0,
            "wind_speed": 5,
            "wind_direction": 180,
            "uv_index": 3.0,
            "visibility": 10.0,
            "dew_point": 60,
            "clouds": 25,
            "sunrise": "06:30",
            "sunset": "19:30",
            "daily_high": 75,
            "daily_low": 65,
            "location": settings.DEFAULT_LOCATION,
            "last_updated": now.isoformat(),
            "air_quality_impact": "Unable to determine",
            "weather_icon": "01d"
        }

def calculate_air_quality_impact(uv_index: float, weather_id: int) -> str:
    """Calculate air quality impact based on UV index and weather conditions"""
    
    # Weather ID ranges (OpenWeatherMap codes)
    # 2xx: Thunderstorm, 3xx: Drizzle, 5xx: Rain, 6xx: Snow, 7xx: Atmosphere, 800: Clear, 80x: Clouds
    
    if weather_id in range(200, 300):  # Thunderstorm
        return "Poor air quality - stay indoors"
    elif weather_id in range(500, 600):  # Rain
        return "Good air quality - rain cleanses air"
    elif weather_id in range(700, 800):  # Fog, dust, etc.
        return "Reduced air quality - limit outdoor activities"
    elif weather_id == 800:  # Clear sky
        if uv_index > 8:
            return "High UV - use sun protection"
        elif uv_index > 5:
            return "Moderate UV - some protection needed"
        else:
            return "Excellent conditions"
    else:  # Cloudy
        return "Neutral impact"

@router.get("/cache-stats")
async def get_cache_stats():
    """Debug endpoint to check cache status"""
    return {
        "cached_items": len(weather_cache),
        "cache_keys": list(weather_cache.keys()),
        "cache_ages_minutes": {
            key: round((datetime.utcnow() - datetime.fromisoformat(data["cached_at"])).total_seconds() / 60, 2)
            for key, data in weather_cache.items()
        },
        "cache_duration_minutes": CACHE_DURATION_MINUTES,
        "api_key_configured": bool(settings.OPENWEATHER_API_KEY),
        "api_endpoint": "One Call API 3.0"
    }

@router.get("/forecast")
async def get_weather_forecast():
    """Get hourly and daily forecast data"""
    
    if not settings.OPENWEATHER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenWeather API key not configured")
    
    cache_key = f"forecast_{settings.DEFAULT_LOCATION.lower().replace(' ', '_').replace(',', '')}"
    now = datetime.utcnow()
    
    # Check cache first
    if cache_key in weather_cache:
        cached_data = weather_cache[cache_key]
        cache_time = datetime.fromisoformat(cached_data["cached_at"])
        
        if now - cache_time < timedelta(minutes=CACHE_DURATION_MINUTES):
            return cached_data["data"]
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://api.openweathermap.org/data/3.0/onecall",
                params={
                    "lat": settings.DEFAULT_LATITUDE,
                    "lon": settings.DEFAULT_LONGITUDE,
                    "exclude": "current,minutely,alerts",
                    "appid": settings.OPENWEATHER_API_KEY,
                    "units": "imperial"
                }
            )
            
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Weather forecast API unavailable")
            
        weather_data = response.json()
        
        # Format forecast data
        forecast_data = {
            "hourly": [
                {
                    "time": datetime.fromtimestamp(hour["dt"]).strftime("%H:%M"),
                    "temperature": round(hour["temp"]),
                    "description": hour["weather"][0]["description"].title(),
                    "icon": hour["weather"][0]["icon"],
                    "pop": round(hour.get("pop", 0) * 100)  # Probability of precipitation
                }
                for hour in weather_data["hourly"][:12]  # Next 12 hours
            ],
            "daily": [
                {
                    "date": datetime.fromtimestamp(day["dt"]).strftime("%A"),
                    "high": round(day["temp"]["max"]),
                    "low": round(day["temp"]["min"]),
                    "description": day["weather"][0]["description"].title(),
                    "icon": day["weather"][0]["icon"],
                    "pop": round(day.get("pop", 0) * 100)
                }
                for day in weather_data["daily"][:7]  # Next 7 days
            ]
        }
        
        # Cache forecast data
        weather_cache[cache_key] = {
            "data": forecast_data,
            "cached_at": now.isoformat()
        }
        
        return forecast_data
        
    except Exception as e:
        logger.error(f"Weather forecast API error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch weather forecast")