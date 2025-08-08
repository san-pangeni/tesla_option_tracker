'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Percent, Calendar, BarChart3 } from 'lucide-react'

interface Trade {
  id: string
  type: 'call' | 'put'
  shortStrike: number
  longStrike: number
  expiration: string
  creditReceived: number
  maxProfit: number
  maxLoss: number
  entryDate: string
  exitDate?: string
  status: 'open' | 'profit' | 'loss' | 'expired'
  realizedPnL?: number
  notes?: string
}

interface PerformanceMetrics {
  totalTrades: number
  winRate: number
  avgWin: number
  avgLoss: number
  totalPnL: number
  profitFactor: number
  sharpeRatio: number
  maxDrawdown: number
  bestTrade: number
  worstTrade: number
}

export default function PerformanceTracker() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTrade, setNewTrade] = useState({
    type: 'call' as 'call' | 'put',
    shortStrike: '',
    longStrike: '',
    expiration: '',
    creditReceived: '',
    maxLoss: '',
    notes: ''
  })

  // Load trades from localStorage
  useEffect(() => {
    const savedTrades = localStorage.getItem('tsla-credit-spread-trades')
    if (savedTrades) {
      try {
        setTrades(JSON.parse(savedTrades))
      } catch (error) {
        console.error('Error loading trades:', error)
      }
    }
  }, [])

  // Save trades to localStorage
  useEffect(() => {
    localStorage.setItem('tsla-credit-spread-trades', JSON.stringify(trades))
  }, [trades])

  const calculateMetrics = (): PerformanceMetrics => {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        totalPnL: 0,
        profitFactor: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        bestTrade: 0,
        worstTrade: 0
      }
    }

    const closedTrades = trades.filter(t => t.status !== 'open')
    const winningTrades = closedTrades.filter(t => (t.realizedPnL || 0) > 0)
    const losingTrades = closedTrades.filter(t => (t.realizedPnL || 0) < 0)

    const totalPnL = closedTrades.reduce((sum, t) => sum + (t.realizedPnL || 0), 0)
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0
    const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + (t.realizedPnL || 0), 0) / winningTrades.length : 0
    const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.realizedPnL || 0), 0) / losingTrades.length) : 0
    
    const grossProfit = winningTrades.reduce((sum, t) => sum + (t.realizedPnL || 0), 0)
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.realizedPnL || 0), 0))
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0

    const allPnL = closedTrades.map(t => t.realizedPnL || 0)
    const bestTrade = allPnL.length > 0 ? Math.max(...allPnL) : 0
    const worstTrade = allPnL.length > 0 ? Math.min(...allPnL) : 0

    // Calculate max drawdown
    let runningPnL = 0
    let peak = 0
    let maxDrawdown = 0

    closedTrades.forEach(trade => {
      runningPnL += trade.realizedPnL || 0
      if (runningPnL > peak) {
        peak = runningPnL
      }
      const drawdown = peak - runningPnL
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    })

    return {
      totalTrades: closedTrades.length,
      winRate,
      avgWin,
      avgLoss,
      totalPnL,
      profitFactor,
      sharpeRatio: 0, // Simplified for now
      maxDrawdown,
      bestTrade,
      worstTrade
    }
  }

  const addTrade = () => {
    const shortStrike = parseFloat(newTrade.shortStrike)
    const longStrike = parseFloat(newTrade.longStrike)
    const creditReceived = parseFloat(newTrade.creditReceived)
    const maxLoss = parseFloat(newTrade.maxLoss)

    if (isNaN(shortStrike) || isNaN(longStrike) || isNaN(creditReceived)) return

    const trade: Trade = {
      id: Date.now().toString(),
      type: newTrade.type,
      shortStrike,
      longStrike,
      expiration: newTrade.expiration,
      creditReceived,
      maxProfit: creditReceived,
      maxLoss: maxLoss || (Math.abs(longStrike - shortStrike) - creditReceived),
      entryDate: new Date().toISOString(),
      status: 'open',
      notes: newTrade.notes
    }

    setTrades(prev => [...prev, trade])
    setNewTrade({
      type: 'call',
      shortStrike: '',
      longStrike: '',
      expiration: '',
      creditReceived: '',
      maxLoss: '',
      notes: ''
    })
    setShowAddForm(false)
  }

  const closeTrade = (id: string, pnl: number, status: 'profit' | 'loss' | 'expired') => {
    setTrades(prev => 
      prev.map(trade => 
        trade.id === id 
          ? { 
              ...trade, 
              status, 
              realizedPnL: pnl, 
              exitDate: new Date().toISOString() 
            }
          : trade
      )
    )
  }

  const metrics = calculateMetrics()

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>
            Track your credit spread trading performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.totalTrades}
              </div>
              <div className="text-xs text-gray-600">Total Trades</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${metrics.winRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.winRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600">Win Rate</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${metrics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${metrics.totalPnL.toFixed(2)}
              </div>
              <div className="text-xs text-gray-600">Total P&L</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${metrics.profitFactor >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.profitFactor.toFixed(2)}
              </div>
              <div className="text-xs text-gray-600">Profit Factor</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                ${metrics.avgWin.toFixed(2)}
              </div>
              <div className="text-xs text-green-700">Avg Win</div>
            </div>
            
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-600">
                ${metrics.avgLoss.toFixed(2)}
              </div>
              <div className="text-xs text-red-700">Avg Loss</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trade Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Trade Management</CardTitle>
              <CardDescription>
                Track your active and closed credit spreads
              </CardDescription>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Trade
            </button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Add Trade Form */}
          {showAddForm && (
            <div className="p-4 border rounded-lg mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={newTrade.type}
                    onChange={(e) => setNewTrade({...newTrade, type: e.target.value as 'call' | 'put'})}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="call">Bear Call Spread</option>
                    <option value="put">Bull Put Spread</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expiration</label>
                  <input
                    type="date"
                    value={newTrade.expiration}
                    onChange={(e) => setNewTrade({...newTrade, expiration: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Short Strike</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTrade.shortStrike}
                    onChange={(e) => setNewTrade({...newTrade, shortStrike: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Long Strike</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTrade.longStrike}
                    onChange={(e) => setNewTrade({...newTrade, longStrike: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Credit Received</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTrade.creditReceived}
                    onChange={(e) => setNewTrade({...newTrade, creditReceived: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                <textarea
                  value={newTrade.notes}
                  onChange={(e) => setNewTrade({...newTrade, notes: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  rows={2}
                  placeholder="Trade rationale, market conditions, etc."
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={addTrade}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                >
                  Add Trade
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Trades List */}
          <div className="space-y-3">
            {trades.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No trades recorded. Click "Add Trade" to start tracking.
              </div>
            ) : (
              trades.slice().reverse().map(trade => (
                <div
                  key={trade.id}
                  className={`p-4 border rounded-lg ${
                    trade.status === 'open' ? 'border-blue-200 bg-blue-50' :
                    trade.status === 'profit' ? 'border-green-200 bg-green-50' :
                    trade.status === 'loss' ? 'border-red-200 bg-red-50' :
                    'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={trade.type === 'call' ? 'destructive' : 'success'}>
                          {trade.type === 'call' ? (
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
                          ${trade.shortStrike}/${trade.longStrike}
                        </Badge>
                        <Badge variant="secondary">
                          {new Date(trade.expiration).toLocaleDateString()}
                        </Badge>
                      </div>

                      <div className="text-sm space-y-1">
                        <div>Credit: ${trade.creditReceived.toFixed(2)}</div>
                        <div>Max Profit: ${trade.maxProfit.toFixed(2)}</div>
                        <div>Max Loss: ${trade.maxLoss.toFixed(2)}</div>
                        {trade.realizedPnL !== undefined && (
                          <div className={`font-medium ${trade.realizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Realized P&L: ${trade.realizedPnL.toFixed(2)}
                          </div>
                        )}
                        {trade.notes && (
                          <div className="text-xs text-gray-600 italic">
                            {trade.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge 
                        variant={
                          trade.status === 'open' ? 'info' :
                          trade.status === 'profit' ? 'success' :
                          trade.status === 'loss' ? 'destructive' :
                          'secondary'
                        }
                      >
                        {trade.status.toUpperCase()}
                      </Badge>

                      {trade.status === 'open' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              const pnl = parseFloat(prompt('Enter realized P&L:') || '0')
                              if (!isNaN(pnl)) {
                                closeTrade(trade.id, pnl, pnl >= 0 ? 'profit' : 'loss')
                              }
                            }}
                            className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Close
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
