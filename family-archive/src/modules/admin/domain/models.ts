export interface AnalyticsEvent {
  id: string
  eventName: string
  metadata: any
  createdAt: string
}

export interface DailyStats {
  date: string
  count: number
}
