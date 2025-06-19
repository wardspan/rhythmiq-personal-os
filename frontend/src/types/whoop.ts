export interface WhoopHealthData {
  whoop_connected: boolean
  recovery_score?: number
  hrv_score?: number
  resting_heart_rate?: number
  readiness_score?: number
  sleep_duration?: number // hours
  sleep_quality?: number // score
  sleep_efficiency?: number // percentage
  last_updated?: string // ISO timestamp
  error?: string
}

export interface WhoopStatus {
  connected: boolean
  last_sync?: string
  enabled: boolean
  profile?: {
    name?: string
    email?: string
  }
  error?: string
}

export interface WhoopRecoveryRecord {
  id: string
  whoop_id: string
  recovery_score?: number
  resting_heart_rate?: number
  hrv_rmssd?: number
  spo2_percentage?: number
  skin_temp_celsius?: number
  score_state: string
  created_at: string
}

export interface WhoopSleepRecord {
  id: string
  whoop_id: string
  start_time: string
  end_time: string
  duration_hours?: number
  sleep_score?: number
  sleep_performance_percentage?: number
  sleep_consistency_percentage?: number
  sleep_efficiency_percentage?: number
  disturbance_count?: number
  is_nap: boolean
  score_state: string
  sleep_stages: {
    light_sleep_hours?: number
    deep_sleep_hours?: number
    rem_sleep_hours?: number
    awake_hours?: number
  }
}

export interface WhoopWorkoutRecord {
  id: string
  whoop_id: string
  start_time: string
  end_time: string
  duration_minutes?: number
  sport_name?: string
  strain_score?: number
  average_heart_rate?: number
  max_heart_rate?: number
  kilojoule?: number
  distance_meters?: number
  percent_recorded?: number
  heart_rate_zones: {
    zone_0_minutes?: number
    zone_1_minutes?: number
    zone_2_minutes?: number
    zone_3_minutes?: number
    zone_4_minutes?: number
    zone_5_minutes?: number
  }
}

export interface WhoopRecoveryData {
  records: WhoopRecoveryRecord[]
  count: number
  days_requested: number
}

export interface WhoopSleepData {
  records: WhoopSleepRecord[]
  count: number
  days_requested: number
}

export interface WhoopWorkoutData {
  records: WhoopWorkoutRecord[]
  count: number
  days_requested: number
}

export interface WhoopADHDInsights {
  insights: {
    sleep_consistency: {
      description: string
      average_bedtime_variance?: number
      sleep_duration_variance?: number
      recommendation?: string
    }
    recovery_patterns: {
      description: string
      average_recovery?: number
      recovery_trend?: string
      low_recovery_days: number
    }
    heart_rate_variability: {
      description: string
      average_hrv?: number
      hrv_trend?: string
      stress_indicators: string[]
    }
  }
  data_points: {
    recovery_records: number
    sleep_records: number
    analysis_period_days: number
  }
  recommendations: string[]
}

export interface WhoopConnectionConfig {
  auth_url?: string
  state?: string
  connected: boolean
  enabled: boolean
}