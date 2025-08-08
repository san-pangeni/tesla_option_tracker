'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getRelativeTime, getImpactColor } from '@/lib/utils'
import { ExternalLink, RefreshCw, AlertTriangle, Filter, Clock, TrendingUp } from 'lucide-react'

interface NewsItem {
  title: string
  description: string
  url: string
  publishedAt: string
  source: string
  category: string
  impact: 'high' | 'medium' | 'low'
}

interface NewsData {
  news: NewsItem[]
  lastUpdate: string
  totalItems: number
}

const IMPACT_ICONS = {
  high: TrendingUp,
  medium: AlertTriangle,
  low: Clock
}

export default function MarketNews() {
  const [data, setData] = useState<NewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/market-news')
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
        setError(null)
      } else {
        setError('Failed to fetch market news')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const filteredNews = data?.news.filter(item => {
    const impactMatch = filter === 'all' || item.impact === filter
    const categoryMatch = categoryFilter === 'all' || item.category === categoryFilter
    return impactMatch && categoryMatch
  }) || []

  const categories = Array.from(new Set(data?.news.map(item => item.category) || []))

  if (loading && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading Market News...
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
            Error Loading News
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!data) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Market-Moving News</CardTitle>
            <CardDescription>
              Real-time updates on events that impact TSLA and broader markets
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

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Impact:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {filteredNews.map((item, index) => {
            const ImpactIcon = IMPACT_ICONS[item.impact]
            return (
              <div
                key={index}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {item.source}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                      <Badge 
                        className={`text-xs ${getImpactColor(item.impact)}`}
                      >
                        <ImpactIcon className="h-3 w-3 mr-1" />
                        {item.impact.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getRelativeTime(item.publishedAt)}
                      </span>
                    </div>

                    <h3 className="font-semibold text-sm leading-tight">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {item.url !== '#' && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            )
          })}

          {filteredNews.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No news items match the current filters.
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {filteredNews.length} of {data.totalItems} items
          <br />
          Last updated: {new Date(data.lastUpdate).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  )
}
