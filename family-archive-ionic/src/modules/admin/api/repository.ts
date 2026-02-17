import { supabase } from '@/lib/supabase'

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

export class AnalyticsRepository {
  
  /**
   * Log an internal event
   */
  static async logEvent(eventName: string, metadata: any = {}, userId?: string) {
    // Generate or retrieve a simple session ID from local storage for anon tracking
    let sessionId = localStorage.getItem('analytics_session_id')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      localStorage.setItem('analytics_session_id', sessionId)
    }

    await supabase.from('analytics_events').insert({
      event_name: eventName,
      metadata,
      session_id: sessionId,
      user_id: userId || null
    })
  }

  /**
   * Get events grouped by day for the last N days
   */
  static async getDailyStats(eventName: string, days: number = 7): Promise<DailyStats[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { data, error } = await supabase
      .from('analytics_events')
      .select('created_at')
      .eq('event_name', eventName)
      .gte('created_at', startDate.toISOString())

    if (error || !data) {
      console.error('Failed to fetch stats', error)
      return []
    }

    // Client-side aggregation (okay for MVP volume)
    const statsMap = new Map<string, number>()
    
    // Initialize all days with 0
    for (let i = 0; i < days; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      statsMap.set(dateStr, 0)
    }

    // Count events
    data.forEach(row => {
      const dateStr = row.created_at.split('T')[0]
      if (statsMap.has(dateStr)) {
        statsMap.set(dateStr, statsMap.get(dateStr)! + 1)
      }
    })

    // Convert to array and sort
    return Array.from(statsMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  /**
   * Get total counts for dashboard cards
   */
  static async getTotalCount(eventName: string): Promise<number> {
    const { count, error } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_name', eventName)
    
    return count || 0
  }
}
