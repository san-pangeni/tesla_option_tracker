'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamic imports to prevent SSR issues
const OptionsRecommendations = dynamic(() => import('@/components/OptionsRecommendations'), { ssr: false })
const MarketNews = dynamic(() => import('@/components/MarketNews'), { ssr: false })
const EconomicCalendar = dynamic(() => import('@/components/EconomicCalendar'), { ssr: false })
const PriceAlerts = dynamic(() => import('@/components/PriceAlerts'), { ssr: false })
const PerformanceTracker = dynamic(() => import('@/components/PerformanceTracker'), { ssr: false })
const ServiceWorkerRegistration = dynamic(() => import('@/components/ServiceWorkerRegistration'), { ssr: false })
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, AlertTriangle, Info, Zap, Target, DollarSign } from 'lucide-react'

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const isMarketOpen = () => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const day = now.getDay()
    
    // Market is open 9:30 AM - 4:00 PM ET, Monday-Friday
    const isWeekday = day >= 1 && day <= 5
    const isMarketHours = (hours === 9 && minutes >= 30) || (hours >= 10 && hours < 16)
    
    return isWeekday && isMarketHours
  }

  return (
    <>
      <ServiceWorkerRegistration />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TSLA Options Tracker
                </h1>
                <p className="text-sm text-gray-600">
                  Real-time credit spread recommendations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge 
                variant={isMarketOpen() ? 'success' : 'destructive'}
                className="text-sm"
              >
                {isMarketOpen() ? 'Market Open' : 'Market Closed'}
              </Badge>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {currentTime.toLocaleTimeString()}
                </div>
                <div className="text-xs text-gray-500">
                  {currentTime.toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">
                Credit Spreads Focus
              </CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xs text-blue-700">
                Selling premium with limited risk through credit spreads. 
                Target 7-DTE options for optimal time decay.
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">
                Risk Management
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xs text-green-700">
                Max loss is limited to the spread width minus credit received. 
                Never risk more than 2-3% of portfolio per trade.
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">
                Market Events
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xs text-orange-700">
                Monitor high-impact events like Fed meetings, CPI releases, 
                and earnings that can cause significant price movements.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Strategy Notice */}
        <Card className="mb-8 border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Info className="h-5 w-5" />
              Trading Strategy Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-amber-700 space-y-2">
            <p>
              <strong>Bull Put Spreads:</strong> Profit when TSLA stays above the short put strike. 
              Best in neutral to bullish markets.
            </p>
            <p>
              <strong>Bear Call Spreads:</strong> Profit when TSLA stays below the short call strike. 
              Best in neutral to bearish markets.
            </p>
            <p>
              <strong>Risk Warning:</strong> Options trading involves substantial risk. 
              Past performance does not guarantee future results. Trade responsibly.
            </p>
          </CardContent>
        </Card>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* Options Recommendations */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <OptionsRecommendations />
            <PerformanceTracker />
          </div>

          {/* Sidebar - News, Calendar, and Alerts */}
          <div className="space-y-4 md:space-y-6 lg:col-span-1">
            <PriceAlerts />
            <MarketNews />
            <EconomicCalendar />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-500 border-t pt-8">
          <p>
            This application is for educational purposes only. 
            Not financial advice. Trade at your own risk.
          </p>
          <p className="mt-2">
            Data provided by Yahoo Finance and Alpha Vantage APIs.
            Real-time updates every 30 seconds during market hours.
          </p>
        </footer>
      </main>
    </div>
    </>
  )
}
