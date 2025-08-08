# TSLA Options Tracker 📈

A high-performance real-time web application for tracking Tesla (TSLA) credit spread opportunities and market-moving events. Built with Next.js 14, TypeScript, and Tailwind CSS.

## ✨ Features

### 🎯 Credit Spread Recommendations
- **7-DTE Focus**: Optimized for 7-day to expiration options for maximum time decay
- **Bull Put & Bear Call Spreads**: Both strategies with risk/reward analysis
- **Real-time Calculations**: Advanced probability models and breakeven analysis
- **Smart Filtering**: Only shows spreads with favorable risk/reward ratios

### 📊 Real-time Data
- **Live Price Updates**: WebSocket-like polling for current TSLA price
- **Options Chain Data**: Real-time bid/ask spreads and implied volatility
- **Market Hours Detection**: Smart scheduling based on market sessions

### 📰 Market Intelligence
- **Economic Calendar**: Fed meetings, CPI releases, earnings dates
- **Market News**: Curated high-impact news from multiple sources
- **Event Impact Scoring**: High/Medium/Low impact categorization

### 🔔 Price Alerts
- **Custom Alerts**: Set price targets above or below current levels
- **Browser Notifications**: Desktop notifications even when tab is inactive
- **Smart Persistence**: Alerts survive browser restarts

### 📈 Performance Tracking
- **Trade Journal**: Track your credit spread trades
- **Performance Metrics**: Win rate, profit factor, average win/loss
- **P&L Tracking**: Real-time profit and loss calculations

### 📱 PWA Support
- **Installable**: Add to home screen on mobile and desktop
- **Offline Support**: Service worker caching for core functionality
- **Responsive Design**: Optimized for all screen sizes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tsla-options-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your API keys (all optional - app works with demo data):
   ```bash
   # Free API Keys (optional but recommended)
   ALPHA_VANTAGE_API_KEY=your_key_here
   NEWS_API_KEY=your_key_here
   POLYGON_API_KEY=your_key_here
   FMP_API_KEY=your_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 API Keys Setup (Optional)

The application works with fallback data, but for the best experience, get these free API keys:

### Alpha Vantage (Recommended)
- **Free Tier**: 5 calls/minute, 500 calls/day
- **Sign up**: [alphavantage.co](https://www.alphavantage.co/support/#api-key)
- **Used for**: Stock prices, company fundamentals

### NewsAPI
- **Free Tier**: 1000 requests/month
- **Sign up**: [newsapi.org](https://newsapi.org/register)
- **Used for**: Market news and events

### Polygon.io
- **Free Tier**: 5 calls/minute
- **Sign up**: [polygon.io](https://polygon.io/)
- **Used for**: Options data backup

### Financial Modeling Prep
- **Free Tier**: 250 requests/day
- **Sign up**: [financialmodelingprep.com](https://financialmodelingprep.com/developer/docs)
- **Used for**: Economic calendar, earnings dates

## 📱 Mobile & PWA

### Install as App
1. **Mobile**: Tap "Add to Home Screen" when prompted
2. **Desktop**: Click the install button in the address bar
3. **Chrome**: Menu → Install TSLA Options Tracker

### Features
- ✅ Works offline with cached data
- ✅ Push notifications for price alerts
- ✅ Native app-like experience
- ✅ Auto-updates when online

## 🎛️ Usage Guide

### Setting Up Price Alerts
1. Navigate to the **Price Alerts** section
2. Click **"Add Alert"**
3. Set your target price and condition (above/below)
4. Enable browser notifications when prompted
5. Alerts will trigger even when the tab is inactive

### Tracking Performance
1. Go to **Performance Tracker**
2. Click **"Add Trade"** when you enter a credit spread
3. Input your strike prices, expiration, and credit received
4. Close trades manually when you exit the position
5. View your statistics and performance metrics

### Using Recommendations
1. Check **Options Recommendations** for current opportunities
2. Filter by spread type (Bull Put or Bear Call)
3. Review probability of profit and risk/reward ratios
4. Consider market events from the **Economic Calendar**

## 🛠️ Development

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom shadcn/ui components
- **Icons**: Lucide React
- **State**: React hooks with localStorage persistence
- **APIs**: Multiple free financial data sources

### Project Structure
```
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── EconomicCalendar.tsx
│   ├── MarketNews.tsx
│   ├── OptionsRecommendations.tsx
│   ├── PerformanceTracker.tsx
│   └── PriceAlerts.tsx
├── lib/                  # Utilities
│   ├── cache.ts          # API caching
│   ├── utils.ts          # Helper functions
│   └── websocket.ts      # Real-time data
└── public/               # Static assets
    ├── manifest.json     # PWA manifest
    └── sw.js            # Service worker
```

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🚀 Deployment

### Vercel (Recommended)
1. **Connect Repository**: Import your Git repository
2. **Environment Variables**: Add your API keys in Vercel dashboard
3. **Deploy**: Automatic deployments on every push

### Other Platforms
- **Netlify**: Works with static export
- **Railway**: Direct deployment support
- **DigitalOcean**: App Platform compatible

### Build Optimization
- ✅ Automatic code splitting
- ✅ Image optimization
- ✅ Service worker caching
- ✅ Gzip compression
- ✅ Bundle analysis available

## 📊 Performance Features

### Caching Strategy
- **API Responses**: 30-second cache for options data
- **News Data**: 5-minute cache for market news
- **Economic Calendar**: 4-hour cache for event data
- **Service Worker**: Offline fallback caching

### Real-time Updates
- **Price Data**: Every 5 seconds during market hours
- **Options Data**: Every 30 seconds
- **News**: Every 2 minutes
- **Automatic Retry**: With exponential backoff

## ⚠️ Risk Disclaimer

**This application is for educational purposes only.**

- ❌ Not financial advice
- ❌ No guarantee of accuracy
- ❌ Past performance ≠ future results
- ✅ Always do your own research
- ✅ Never risk more than you can afford to lose
- ✅ Options trading involves substantial risk

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Yahoo Finance** for free options data
- **Alpha Vantage** for stock prices and fundamentals  
- **NewsAPI** for market news
- **Lucide** for beautiful icons
- **Tailwind CSS** for styling system
- **Next.js** team for the amazing framework

---

**Built with ❤️ for the options trading community**