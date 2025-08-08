'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { TrendingUp, TrendingDown, RefreshCw, AlertTriangle } from 'lucide-react'

interface CreditSpreadRecommendation {
  type: 'call' | 'put'
  shortStrike: number
  longStrike: number
  expiration: string
  creditReceived: number
  maxProfit: number
  maxLoss: number
  breakeven: number
  probOfProfit: number
  riskRewardRatio: number
  daysToExpiration: number
}

interface OptionsData {
  currentPrice: number
  lastUpdate: string
  recommendations: CreditSpreadRecommendation[]
}

export default function OptionsRecommendations() {
  const [data, setData] = useState<OptionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tsla-options')
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
        setError(null)
      } else {
        setError('Failed to fetch options data')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading TSLA Options...
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
            Error Loading Data
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Current Price Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>TSLA Current Price</span>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(data.currentPrice)}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {new Date(data.lastUpdate).toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>

      {/* Credit Spread Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>7-DTE Credit Spread Recommendations</CardTitle>
          <CardDescription>
            Selling credit spreads with optimal risk/reward ratios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.recommendations.map((rec, index) => (
              <Card key={index} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={rec.type === 'call' ? 'destructive' : 'success'}
                      className="text-xs"
                    >
                      {rec.type === 'call' ? (
                        <>
                          <TrendingDown className="h-3 w-3 mr-1" />
                          Bear Call
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Bull Put
                        </>
                      )}
                    </Badge>
                    <Badge variant="outline">
                      {rec.daysToExpiration}d
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Short Strike:</span>
                      <span className="font-medium">${rec.shortStrike}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Long Strike:</span>
                      <span className="font-medium">${rec.longStrike}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Expiration:</span>
                      <span className="font-medium">{rec.expiration}</span>
                    </div>
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Credit Received:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(rec.creditReceived)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Max Profit:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(rec.maxProfit)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Max Loss:</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(rec.maxLoss)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Breakeven:</span>
                      <span className="font-medium">${rec.breakeven.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Prob. of Profit:</span>
                      <span className="font-medium">
                        {formatPercentage(rec.probOfProfit)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Risk/Reward:</span>
                      <span className="font-medium">
                        1:{rec.riskRewardRatio.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Profit/Loss Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Risk</span>
                      <span>Reward</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(rec.riskRewardRatio / (1 + rec.riskRewardRatio)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {data.recommendations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No suitable credit spreads found for current market conditions.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
