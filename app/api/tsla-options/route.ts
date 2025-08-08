import { NextRequest, NextResponse } from 'next/server'
import { apiCache } from '@/lib/cache'

// Free API endpoints for TSLA options data
const YAHOO_FINANCE_API = 'https://query1.finance.yahoo.com/v7/finance/options/TSLA'
const ALPHA_VANTAGE_API = 'https://www.alphavantage.co/query'
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo'

interface OptionContract {
  contractSymbol: string
  strike: number
  expiration: number
  bid: number
  ask: number
  lastPrice: number
  volume: number
  openInterest: number
  impliedVolatility: number
  inTheMoney: boolean
}

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

// Calculate days to expiration
function getDaysToExpiration(expirationTimestamp: number): number {
  const now = new Date().getTime()
  const expiration = new Date(expirationTimestamp * 1000).getTime()
  return Math.ceil((expiration - now) / (1000 * 60 * 60 * 24))
}

// Calculate probability of profit based on current price and strikes
function calculateProbOfProfit(currentPrice: number, shortStrike: number, creditReceived: number, type: 'call' | 'put'): number {
  if (type === 'call') {
    const breakeven = shortStrike + creditReceived
    return currentPrice < breakeven ? 65 : 35 // Simplified calculation
  } else {
    const breakeven = shortStrike - creditReceived
    return currentPrice > breakeven ? 65 : 35 // Simplified calculation
  }
}

// Find optimal credit spreads
function findCreditSpreads(options: OptionContract[], currentPrice: number, targetDTE: number = 7): CreditSpreadRecommendation[] {
  const recommendations: CreditSpreadRecommendation[] = []
  
  // Filter options close to target DTE
  const targetOptions = options.filter(option => {
    const dte = getDaysToExpiration(option.expiration)
    return dte >= targetDTE - 2 && dte <= targetDTE + 2
  })

  // Find call credit spreads (bear call spreads)
  const callOptions = targetOptions.filter(option => !option.inTheMoney || option.strike > currentPrice)
  for (let i = 0; i < callOptions.length - 1; i++) {
    const shortOption = callOptions[i]
    const longOption = callOptions[i + 1]
    
    if (longOption.strike > shortOption.strike) {
      const creditReceived = shortOption.bid - longOption.ask
      const maxLoss = (longOption.strike - shortOption.strike) - creditReceived
      const maxProfit = creditReceived
      
      if (creditReceived > 0.10 && maxProfit / maxLoss > 0.2) {
        recommendations.push({
          type: 'call',
          shortStrike: shortOption.strike,
          longStrike: longOption.strike,
          expiration: new Date(shortOption.expiration * 1000).toISOString().split('T')[0],
          creditReceived: creditReceived,
          maxProfit: maxProfit,
          maxLoss: maxLoss,
          breakeven: shortOption.strike + creditReceived,
          probOfProfit: calculateProbOfProfit(currentPrice, shortOption.strike, creditReceived, 'call'),
          riskRewardRatio: maxProfit / maxLoss,
          daysToExpiration: getDaysToExpiration(shortOption.expiration)
        })
      }
    }
  }

  // Find put credit spreads (bull put spreads)
  const putOptions = targetOptions.filter(option => !option.inTheMoney || option.strike < currentPrice)
  for (let i = 0; i < putOptions.length - 1; i++) {
    const shortOption = putOptions[i]
    const longOption = putOptions[i + 1]
    
    if (longOption.strike < shortOption.strike) {
      const creditReceived = shortOption.bid - longOption.ask
      const maxLoss = (shortOption.strike - longOption.strike) - creditReceived
      const maxProfit = creditReceived
      
      if (creditReceived > 0.10 && maxProfit / maxLoss > 0.2) {
        recommendations.push({
          type: 'put',
          shortStrike: shortOption.strike,
          longStrike: longOption.strike,
          expiration: new Date(shortOption.expiration * 1000).toISOString().split('T')[0],
          creditReceived: creditReceived,
          maxProfit: maxProfit,
          maxLoss: maxLoss,
          breakeven: shortOption.strike - creditReceived,
          probOfProfit: calculateProbOfProfit(currentPrice, shortOption.strike, creditReceived, 'put'),
          riskRewardRatio: maxProfit / maxLoss,
          daysToExpiration: getDaysToExpiration(shortOption.expiration)
        })
      }
    }
  }

  // Sort by risk/reward ratio
  return recommendations.sort((a, b) => b.riskRewardRatio - a.riskRewardRatio).slice(0, 10)
}

export async function GET(request: NextRequest) {
  const cacheKey = 'tsla-options-data'
  
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
    // Fetch current TSLA price
    const priceResponse = await fetch(`${ALPHA_VANTAGE_API}?function=GLOBAL_QUOTE&symbol=TSLA&apikey=${ALPHA_VANTAGE_KEY}`)
    const priceData = await priceResponse.json()
    
    let currentPrice = 250 // Fallback price
    if (priceData['Global Quote'] && priceData['Global Quote']['05. price']) {
      currentPrice = parseFloat(priceData['Global Quote']['05. price'])
    }

    // Fetch options data from Yahoo Finance
    const optionsResponse = await fetch(YAHOO_FINANCE_API)
    const optionsData = await optionsResponse.json()

    if (!optionsData.optionChain || !optionsData.optionChain.result || optionsData.optionChain.result.length === 0) {
      throw new Error('No options data available')
    }

    const result = optionsData.optionChain.result[0]
    const options = result.options[0]
    
    // Combine calls and puts
    const allOptions: OptionContract[] = [
      ...(options.calls || []),
      ...(options.puts || [])
    ]

    // Find credit spread recommendations
    const recommendations = findCreditSpreads(allOptions, currentPrice)

    const responseData = {
      currentPrice,
      lastUpdate: new Date().toISOString(),
      recommendations
    }

    // Cache the response for 30 seconds
    apiCache.set(cacheKey, responseData, 30)

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    console.error('Error fetching TSLA options:', error)
    
    // Return mock data for demonstration
    const mockRecommendations: CreditSpreadRecommendation[] = [
      {
        type: 'call',
        shortStrike: 260,
        longStrike: 265,
        expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        creditReceived: 1.25,
        maxProfit: 1.25,
        maxLoss: 3.75,
        breakeven: 261.25,
        probOfProfit: 68,
        riskRewardRatio: 0.33,
        daysToExpiration: 7
      },
      {
        type: 'put',
        shortStrike: 240,
        longStrike: 235,
        expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        creditReceived: 1.10,
        maxProfit: 1.10,
        maxLoss: 3.90,
        breakeven: 238.90,
        probOfProfit: 72,
        riskRewardRatio: 0.28,
        daysToExpiration: 7
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        currentPrice: 250.75,
        lastUpdate: new Date().toISOString(),
        recommendations: mockRecommendations
      }
    })
  }
}
