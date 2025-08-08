# TSLA Options Credit Spread Tracker

A high-performance real-time web application that provides TSLA 7-DTE credit spread recommendations and market-moving news updates. Built with Next.js 14, TypeScript, and TailwindCSS for optimal performance and user experience.

## 🚀 Features

### Options Trading
- **Credit Spread Recommendations**: Real-time analysis of optimal 7-DTE call and put credit spreads
- **Risk/Reward Analysis**: Detailed calculations including max profit, max loss, breakeven points
- **Probability Analysis**: Estimated probability of profit for each recommendation
- **Live TSLA Price**: Real-time stock price updates

### Market Intelligence
- **Market-Moving News**: Real-time headlines for Fed meetings, CPI data, earnings, and major announcements
- **Event Categorization**: Automatic classification by impact level (High/Medium/Low)
- **Source Filtering**: Filter news by category and impact level
- **Real-time Updates**: Automatic refresh every 30-60 seconds

### Performance Features
- **High-Performance UI**: Optimized with Next.js 14 App Router and React Server Components
- **Real-time Updates**: Live data refreshing without full page reloads
- **Responsive Design**: Beautiful UI that works on desktop, tablet, and mobile
- **Error Handling**: Graceful fallbacks and error recovery

## 🛠 Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: TailwindCSS with custom design system
- **Icons**: Lucide React
- **Data Fetching**: SWR for client-side data fetching
- **APIs**: Yahoo Finance (free), Alpha Vantage (free), NewsAPI (free)

## 📊 Data Sources

### Options Data
- **Yahoo Finance API**: Primary source for TSLA options chains (completely free)
- **Alpha Vantage**: Backup for stock prices and additional market data (free tier: 500 calls/day)

### News Data
- **NewsAPI**: Primary news source (free tier: 1000 requests/month)
- **Alpha Vantage News**: Backup news source for market sentiment

## 🚀 Quick Start

### 1. Installation

```bash
# Clone or download the project files
cd tsla-options-tracker

# Install dependencies
npm install
```

### 2. Environment Setup (Optional)

The app works with demo data out of the box. For live data, copy `env.example` to `.env.local` and add your API keys:

```bash
cp env.example .env.local
```

Edit `.env.local`:
```env
# Optional - app works without these
ALPHA_VANTAGE_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
```

**Free API Keys:**
- Alpha Vantage: [Get free key](https://www.alphavantage.co/support/#api-key)
- NewsAPI: [Get free key](https://newsapi.org/register)

### 3. Run the Application

```bash
# Development server
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📈 Trading Strategy

### Credit Spreads Overview
This application focuses on **selling credit spreads** - a defined-risk options strategy:

#### Bull Put Spreads
- **When to use**: Neutral to bullish outlook on TSLA
- **Profit condition**: TSLA stays above the short put strike
- **Risk**: Limited to spread width minus credit received

#### Bear Call Spreads  
- **When to use**: Neutral to bearish outlook on TSLA
- **Profit condition**: TSLA stays below the short call strike
- **Risk**: Limited to spread width minus credit received

### 7-DTE Focus
- **Time Decay**: Options lose value quickly near expiration
- **Premium Collection**: Higher time decay rates = more premium collection
- **Risk Management**: Shorter timeframe = more predictable outcomes

## 🎯 Key Metrics

The application calculates and displays:

- **Credit Received**: Premium collected from selling the spread
- **Max Profit**: Maximum possible gain (= credit received)
- **Max Loss**: Maximum possible loss (spread width - credit)
- **Breakeven Point**: Stock price where P&L = $0
- **Probability of Profit**: Estimated based on current price vs. strikes
- **Risk/Reward Ratio**: Profit potential vs. risk exposure

## 📰 Market Events Monitoring

### High Impact Events
- Federal Reserve meetings and announcements
- CPI (inflation) data releases
- TSLA earnings reports
- Major product announcements

### Impact Classification
- **High**: Events likely to cause >5% price moves
- **Medium**: Events likely to cause 2-5% price moves  
- **Low**: General market news with <2% impact

## ⚠️ Risk Warnings

- **Options trading involves substantial risk** and is not suitable for all investors
- **Past performance does not guarantee future results**
- **This application is for educational purposes only** - not financial advice
- **Always manage risk appropriately** - never risk more than you can afford to lose
- **Consider consulting a financial advisor** before trading options

## 🔧 Technical Details

### Performance Optimizations
- Server-side rendering with Next.js 14
- Automatic code splitting and optimization
- Efficient API caching and error handling
- Responsive images and lazy loading

### API Rate Limits
- Yahoo Finance: No rate limits (free)
- Alpha Vantage: 5 calls/minute, 500/day (free tier)
- NewsAPI: 1000 requests/month (free tier)

### Browser Support
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 📝 License

This project is for educational purposes. Use at your own risk.

## 🤝 Contributing

This is an educational project. Feel free to fork and modify for your own learning!

---

**Disclaimer**: This application is for educational and informational purposes only. It does not constitute financial advice. Options trading involves substantial risk and is not suitable for all investors. Always do your own research and consider consulting with a qualified financial advisor before making investment decisions.
