'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Calendar, TrendingUp, AlertTriangle, Building, DollarSign } from 'lucide-react'

interface EconomicEvent {
  date: string
  event: string
  importance: 'high' | 'medium' | 'low'
  actual?: string | number
  forecast?: string | number
  previous?: string | number
  currency: string
  impact: 'bullish' | 'bearish' | 'neutral'
  description: string
  category: string
}

interface EarningsEvent {
  date: string
  symbol: string
  time: 'bmo' | 'amc'
  eps_estimate?: number
  eps_actual?: number
  revenue_estimate?: number
  revenue_actual?: number
  importance: 'high' | 'medium' | 'low'
}

interface CalendarData {
  economicEvents: EconomicEvent[]
  earningsEvents: EarningsEvent[]
  lastUpdate: string
  nextUpdate: string
}

const IMPORTANCE_COLORS = {
  high: 'destructive',
  medium: 'warning',
  low: 'secondary'
} as const

const CATEGORY_ICONS = {
  'Federal Reserve': DollarSign,
  'Inflation': TrendingUp,
  'Economic Growth': Building,
  'Employment': Building,
  'Consumer Data': Building,
  'Economic Data': AlertTriangle
} as const

export default function EconomicCalendar() {
  const [data, setData] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/economic-calendar')
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
        setError(null)
      } else {
        setError('Failed to fetch economic calendar')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Update every 4 hours
    const interval = setInterval(fetchData, 4 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        weekday: 'short'
      })
    }
  }

  const getDaysUntil = (dateString: string) => {
    const eventDate = new Date(dateString)
    const today = new Date()
    const diffTime = eventDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading Economic Calendar...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Error Loading Calendar
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!data) return null

  const allEvents = [
    ...data.economicEvents.map(event => ({
      ...event,
      type: 'economic' as const
    })),
    ...data.earningsEvents.map(event => ({
      date: event.date,
      event: `${event.symbol} Earnings`,
      importance: event.importance,
      description: `Tesla Q${Math.ceil(new Date(event.date).getMonth() / 3)} earnings ${event.time === 'bmo' ? 'before market open' : 'after market close'}`,
      category: 'Earnings',
      type: 'earnings' as const,
      symbol: event.symbol,
      time: event.time
    }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Economic Calendar
            </CardTitle>
            <CardDescription>
              Upcoming market-moving events for next 30 days
            </CardDescription>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {allEvents.slice(0, 10).map((event, index) => {
            const CategoryIcon = CATEGORY_ICONS[event.category as keyof typeof CATEGORY_ICONS] || AlertTriangle
            const daysUntil = getDaysUntil(event.date)
            
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                  daysUntil <= 2 ? 'border-red-200 bg-red-50' : 
                  daysUntil <= 7 ? 'border-orange-200 bg-orange-50' : 
                  'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge 
                        variant={IMPORTANCE_COLORS[event.importance]}
                        className="text-xs"
                      >
                        <CategoryIcon className="h-3 w-3 mr-1" />
                        {event.importance.toUpperCase()}
                      </Badge>
                      
                      <Badge variant="outline" className="text-xs">
                        {event.category}
                      </Badge>
                      
                      {event.type === 'earnings' && (
                        <Badge variant="info" className="text-xs">
                          {event.time === 'bmo' ? 'Before Open' : 'After Close'}
                        </Badge>
                      )}
                      
                      <Badge 
                        variant={daysUntil <= 2 ? 'destructive' : daysUntil <= 7 ? 'warning' : 'secondary'}
                        className="text-xs"
                      >
                        {formatDate(event.date)}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-sm leading-tight">
                      {event.event}
                    </h3>

                    <p className="text-xs text-gray-600">
                      {event.description}
                    </p>

                    {daysUntil <= 3 && (
                      <div className="text-xs font-medium text-red-600">
                        ⚠️ High impact event in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {daysUntil === 0 ? 'Today' : 
                       daysUntil === 1 ? 'Tomorrow' : 
                       `${daysUntil} days`}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {allEvents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No upcoming events in the next 30 days
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          Last updated: {new Date(data.lastUpdate).toLocaleTimeString()}
          <br />
          Next update: {new Date(data.nextUpdate).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  )
}
