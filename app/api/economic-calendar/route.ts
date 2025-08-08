import { NextRequest, NextResponse } from 'next/server'
import { apiCache } from '@/lib/cache'

const FMP_API = 'https://financialmodelingprep.com/api/v3'
const FMP_KEY = process.env.FMP_API_KEY || 'demo'
const ALPHA_VANTAGE_API = 'https://www.alphavantage.co/query'
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo'

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
  time: 'bmo' | 'amc' // before market open / after market close
  eps_estimate?: number
  eps_actual?: number
  revenue_estimate?: number
  revenue_actual?: number
  importance: 'high' | 'medium' | 'low'
}

// Static high-impact economic events for 2024
const getStaticEconomicEvents = (): EconomicEvent[] => {
  const events: EconomicEvent[] = []
  const currentYear = new Date().getFullYear()
  
  // FOMC Meeting Dates 2024
  const fomcDates = [
    '2024-03-20', '2024-05-01', '2024-06-12', '2024-07-31',
    '2024-09-18', '2024-11-07', '2024-12-18'
  ]
  
  fomcDates.forEach(date => {
    if (new Date(date) >= new Date()) {
      events.push({
        date,
        event: 'FOMC Meeting - Interest Rate Decision',
        importance: 'high',
        currency: 'USD',
        impact: 'neutral',
        description: 'Federal Reserve monetary policy meeting with potential rate changes',
        category: 'Federal Reserve'
      })
    }
  })

  // CPI Release Dates (typically mid-month)
  for (let month = 1; month <= 12; month++) {
    const cpiDate = new Date(currentYear, month - 1, 15)
    if (cpiDate >= new Date()) {
      events.push({
        date: cpiDate.toISOString().split('T')[0],
        event: 'Consumer Price Index (CPI)',
        importance: 'high',
        currency: 'USD',
        impact: 'neutral',
        description: 'Monthly inflation data that heavily influences Fed policy',
        category: 'Economic Data'
      })
    }
  }

  // Non-Farm Payrolls (first Friday of each month)
  for (let month = 1; month <= 12; month++) {
    const firstOfMonth = new Date(currentYear, month - 1, 1)
    const daysToFirstFriday = (5 - firstOfMonth.getDay() + 7) % 7
    const firstFriday = new Date(firstOfMonth.getTime() + daysToFirstFriday * 24 * 60 * 60 * 1000)
    
    if (firstFriday >= new Date()) {
      events.push({
        date: firstFriday.toISOString().split('T')[0],
        event: 'Non-Farm Payrolls',
        importance: 'high',
        currency: 'USD',
        impact: 'neutral',
        description: 'Monthly employment data showing job growth',
        category: 'Employment'
      })
    }
  }

  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// Tesla-specific earnings dates and events
const getTeslaEvents = (): EarningsEvent[] => {
  const events: EarningsEvent[] = []
  const currentYear = new Date().getFullYear()
  
  // Tesla quarterly earnings (approximate dates)
  const earningsDates = [
    { date: `${currentYear}-01-25`, quarter: 'Q4' },
    { date: `${currentYear}-04-24`, quarter: 'Q1' },
    { date: `${currentYear}-07-24`, quarter: 'Q2' },
    { date: `${currentYear}-10-23`, quarter: 'Q3' }
  ]

  earningsDates.forEach(({ date, quarter }) => {
    if (new Date(date) >= new Date()) {
      events.push({
        date,
        symbol: 'TSLA',
        time: 'amc',
        importance: 'high'
      })
    }
  })

  return events
}

export async function GET(request: NextRequest) {
  const cacheKey = 'economic-calendar-data'
  
  // Try to get cached data first
  const cachedData = apiCache.get(cacheKey)
  if (cachedData) {
    return NextResponse.json({
      success: true,
      data: cachedData,
      cached: true
    })
  }

  try {
    let economicEvents: EconomicEvent[] = []
    let earningsEvents: EarningsEvent[] = []

    // Try to fetch from Financial Modeling Prep
    if (FMP_KEY !== 'demo') {
      try {
        // Economic calendar
        const economicResponse = await fetch(
          `${FMP_API}/economic_calendar?apikey=${FMP_KEY}`
        )
        const economicData = await economicResponse.json()
        
        if (Array.isArray(economicData)) {
          economicEvents = economicData
            .filter(event => {
              const eventDate = new Date(event.date)
              const today = new Date()
              const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
              return eventDate >= today && eventDate <= thirtyDaysFromNow
            })
            .map(event => ({
              date: event.date,
              event: event.event,
              importance: event.impact === 'High' ? 'high' : event.impact === 'Medium' ? 'medium' : 'low',
              actual: event.actual,
              forecast: event.estimate,
              previous: event.previous,
              currency: event.currency,
              impact: 'neutral',
              description: event.event,
              category: determineEventCategory(event.event)
            }))
        }

        // Tesla earnings
        const earningsResponse = await fetch(
          `${FMP_API}/earning_calendar?symbol=TSLA&apikey=${FMP_KEY}`
        )
        const earningsData = await earningsResponse.json()
        
        if (Array.isArray(earningsData)) {
          earningsEvents = earningsData
            .filter(event => new Date(event.date) >= new Date())
            .map(event => ({
              date: event.date,
              symbol: event.symbol,
              time: event.time || 'amc',
              eps_estimate: event.epsEstimated,
              revenue_estimate: event.revenueEstimated,
              importance: 'high'
            }))
        }
      } catch (error) {
        console.error('FMP API error:', error)
      }
    }

    // If no API data available, use static events
    if (economicEvents.length === 0) {
      economicEvents = getStaticEconomicEvents()
    }

    if (earningsEvents.length === 0) {
      earningsEvents = getTeslaEvents()
    }

    // Filter for next 30 days
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const upcomingEconomicEvents = economicEvents.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate >= now && eventDate <= thirtyDaysFromNow
    })

    const upcomingEarningsEvents = earningsEvents.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate >= now && eventDate <= thirtyDaysFromNow
    })

    const responseData = {
      economicEvents: upcomingEconomicEvents.slice(0, 15),
      earningsEvents: upcomingEarningsEvents.slice(0, 10),
      lastUpdate: new Date().toISOString(),
      nextUpdate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // Update every 4 hours
    }

    // Cache for 4 hours (economic calendar doesn't change frequently)
    apiCache.set(cacheKey, responseData, 4 * 60 * 60)

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    console.error('Error fetching economic calendar:', error)
    
    // Return static fallback data
    const fallbackData = {
      economicEvents: getStaticEconomicEvents().slice(0, 15),
      earningsEvents: getTeslaEvents().slice(0, 10),
      lastUpdate: new Date().toISOString(),
      nextUpdate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
    }

    return NextResponse.json({
      success: true,
      data: fallbackData
    })
  }
}

function determineEventCategory(eventName: string): string {
  const name = eventName.toLowerCase()
  
  if (name.includes('fomc') || name.includes('fed') || name.includes('interest rate')) {
    return 'Federal Reserve'
  }
  if (name.includes('cpi') || name.includes('inflation') || name.includes('ppi')) {
    return 'Inflation'
  }
  if (name.includes('gdp') || name.includes('growth')) {
    return 'Economic Growth'
  }
  if (name.includes('employment') || name.includes('payroll') || name.includes('jobless')) {
    return 'Employment'
  }
  if (name.includes('retail') || name.includes('consumer')) {
    return 'Consumer Data'
  }
  
  return 'Economic Data'
}
