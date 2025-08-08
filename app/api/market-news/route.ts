import { NextRequest, NextResponse } from 'next/server'
import { apiCache } from '@/lib/cache'

// Free news APIs
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'demo'
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo'

interface NewsItem {
  title: string
  description: string
  url: string
  publishedAt: string
  source: string
  category: string
  impact: 'high' | 'medium' | 'low'
}

// Market-moving event keywords
const MARKET_KEYWORDS = {
  high: ['fed meeting', 'fomc', 'interest rate', 'cpi', 'inflation', 'earnings', 'tesla earnings', 'elon musk'],
  medium: ['unemployment', 'gdp', 'jobless claims', 'consumer confidence', 'tesla delivery', 'autopilot'],
  low: ['retail sales', 'housing data', 'tesla update', 'model 3', 'model y', 'cybertruck']
}

// Categorize news impact
function categorizeNewsImpact(title: string, description: string): 'high' | 'medium' | 'low' {
  const text = (title + ' ' + description).toLowerCase()
  
  for (const keyword of MARKET_KEYWORDS.high) {
    if (text.includes(keyword)) return 'high'
  }
  
  for (const keyword of MARKET_KEYWORDS.medium) {
    if (text.includes(keyword)) return 'medium'
  }
  
  return 'low'
}

// Determine news category
function determineCategory(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase()
  
  if (text.includes('fed') || text.includes('fomc') || text.includes('interest rate')) return 'Federal Reserve'
  if (text.includes('cpi') || text.includes('inflation')) return 'Economic Data'
  if (text.includes('earnings') || text.includes('tesla earnings')) return 'Earnings'
  if (text.includes('elon musk') || text.includes('tesla')) return 'Tesla'
  if (text.includes('unemployment') || text.includes('jobs')) return 'Employment'
  
  return 'General Market'
}

export async function GET(request: NextRequest) {
  const cacheKey = 'market-news-data'
  
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
    const marketNews: NewsItem[] = []

    // Fetch from NewsAPI (if API key is available)
    if (NEWS_API_KEY !== 'demo') {
      try {
        const newsApiResponse = await fetch(
          `https://newsapi.org/v2/everything?q=tesla OR "federal reserve" OR "interest rates" OR CPI OR inflation OR earnings&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`
        )
        const newsData = await newsApiResponse.json()
        
        if (newsData.articles) {
          newsData.articles.slice(0, 15).forEach((article: any) => {
            const impact = categorizeNewsImpact(article.title, article.description || '')
            const category = determineCategory(article.title, article.description || '')
            
            marketNews.push({
              title: article.title,
              description: article.description || '',
              url: article.url,
              publishedAt: article.publishedAt,
              source: article.source.name,
              category,
              impact
            })
          })
        }
      } catch (error) {
        console.error('NewsAPI error:', error)
      }
    }

    // Fetch from Alpha Vantage News (backup)
    try {
      const alphaResponse = await fetch(
        `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=TSLA&apikey=${ALPHA_VANTAGE_KEY}`
      )
      const alphaData = await alphaResponse.json()
      
      if (alphaData.feed) {
        alphaData.feed.slice(0, 10).forEach((article: any) => {
          const impact = categorizeNewsImpact(article.title, article.summary)
          const category = determineCategory(article.title, article.summary)
          
          marketNews.push({
            title: article.title,
            description: article.summary,
            url: article.url,
            publishedAt: article.time_published,
            source: article.source,
            category,
            impact
          })
        })
      }
    } catch (error) {
      console.error('Alpha Vantage News error:', error)
    }

    // If no real data, return mock data
    if (marketNews.length === 0) {
      const mockNews: NewsItem[] = [
        {
          title: "Fed Signals Potential Rate Cuts in 2024",
          description: "Federal Reserve officials hint at possible interest rate reductions following cooling inflation data.",
          url: "#",
          publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          source: "Reuters",
          category: "Federal Reserve",
          impact: "high"
        },
        {
          title: "Tesla Q4 Earnings Beat Expectations",
          description: "Tesla reports strong Q4 results with record deliveries and improved profit margins.",
          url: "#",
          publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          source: "Bloomberg",
          category: "Earnings",
          impact: "high"
        },
        {
          title: "CPI Data Shows Inflation Cooling to 3.1%",
          description: "December inflation data comes in below expectations, supporting Fed dovish stance.",
          url: "#",
          publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          source: "MarketWatch",
          category: "Economic Data",
          impact: "high"
        },
        {
          title: "Tesla Announces New Gigafactory Location",
          description: "Electric vehicle maker reveals plans for new manufacturing facility to meet growing demand.",
          url: "#",
          publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          source: "TechCrunch",
          category: "Tesla",
          impact: "medium"
        },
        {
          title: "Jobless Claims Fall to Multi-Month Low",
          description: "Weekly unemployment filings decrease, signaling continued labor market strength.",
          url: "#",
          publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
          source: "CNBC",
          category: "Employment",
          impact: "medium"
        }
      ]
      
      return NextResponse.json({
        success: true,
        data: {
          news: mockNews,
          lastUpdate: new Date().toISOString(),
          totalItems: mockNews.length
        }
      })
    }

    // Remove duplicates and sort by impact and recency
    const uniqueNews = marketNews.filter((item, index, self) => 
      index === self.findIndex((t) => t.title === item.title)
    )

    const sortedNews = uniqueNews.sort((a, b) => {
      const impactWeight = { high: 3, medium: 2, low: 1 }
      const aWeight = impactWeight[a.impact]
      const bWeight = impactWeight[b.impact]
      
      if (aWeight !== bWeight) return bWeight - aWeight
      
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    })

    const responseData = {
      news: sortedNews.slice(0, 20),
      lastUpdate: new Date().toISOString(),
      totalItems: sortedNews.length
    }

    // Cache the response for 60 seconds (news updates less frequently)
    apiCache.set(cacheKey, responseData, 60)

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    console.error('Error fetching market news:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch market news' },
      { status: 500 }
    )
  }
}
