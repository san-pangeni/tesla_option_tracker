'use client'

import React from 'react'

type DataType = 'price' | 'options' | 'news'

interface WebSocketMessage {
  type: DataType
  data: any
  timestamp: string
}

interface SubscriptionCallback {
  (data: any): void
}

class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private subscribers: Map<DataType, Set<SubscriptionCallback>> = new Map()
  private isConnecting = false

  constructor() {
    // Initialize subscription maps
    this.subscribers.set('price', new Set())
    this.subscribers.set('options', new Set())
    this.subscribers.set('news', new Set())
  }

  connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return
    }

    this.isConnecting = true

    try {
      // For now, we'll simulate WebSocket with polling since we're using free APIs
      // In production, you'd connect to a real-time data provider
      this.simulateWebSocket()
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      this.handleConnectionError()
    }
  }

  private simulateWebSocket() {
    // Simulate real-time updates by polling APIs at different intervals
    
    // Price updates every 5 seconds during market hours
    const priceInterval = setInterval(async () => {
      if ((this.subscribers.get('price')?.size || 0) > 0) {
        try {
          const response = await fetch('/api/tsla-options')
          const result = await response.json()
          if (result.success) {
            this.broadcast('price', {
              price: result.data.currentPrice,
              timestamp: result.data.lastUpdate
            })
          }
        } catch (error) {
          console.error('Price update failed:', error)
        }
      }
    }, 5000)

    // Options data updates every 30 seconds
    const optionsInterval = setInterval(async () => {
      if ((this.subscribers.get('options')?.size || 0) > 0) {
        try {
          const response = await fetch('/api/tsla-options')
          const result = await response.json()
          if (result.success) {
            this.broadcast('options', result.data)
          }
        } catch (error) {
          console.error('Options update failed:', error)
        }
      }
    }, 30000)

    // News updates every 2 minutes
    const newsInterval = setInterval(async () => {
      if ((this.subscribers.get('news')?.size || 0) > 0) {
        try {
          const response = await fetch('/api/market-news')
          const result = await response.json()
          if (result.success) {
            this.broadcast('news', result.data)
          }
        } catch (error) {
          console.error('News update failed:', error)
        }
      }
    }, 120000)

    // Store interval IDs for cleanup
    this.ws = {
      readyState: WebSocket.OPEN,
      close: () => {
        clearInterval(priceInterval)
        clearInterval(optionsInterval)
        clearInterval(newsInterval)
      }
    } as WebSocket

    this.isConnecting = false
    this.reconnectAttempts = 0
    console.log('WebSocket simulation started')
  }

  private broadcast(type: DataType, data: any) {
    const subscribers = this.subscribers.get(type)
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in ${type} subscriber callback:`, error)
        }
      })
    }
  }

  subscribe(type: DataType, callback: SubscriptionCallback) {
    const subscribers = this.subscribers.get(type)
    if (subscribers) {
      subscribers.add(callback)
      
      // Start connection if this is the first subscriber
      if (this.getTotalSubscribers() === 1) {
        this.connect()
      }
    }

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(type)
      if (subscribers) {
        subscribers.delete(callback)
        
        // Close connection if no more subscribers
        if (this.getTotalSubscribers() === 0) {
          this.disconnect()
        }
      }
    }
  }

  private getTotalSubscribers(): number {
    let total = 0
    const values = Array.from(this.subscribers.values())
    for (const set of values) {
      total += set.size
    }
    return total
  }

  private handleConnectionError() {
    this.isConnecting = false
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      
      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect()
      }, delay)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnecting = false
    this.reconnectAttempts = 0
  }

  getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (this.isConnecting) return 'connecting'
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return 'connected'
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return 'error'
    return 'disconnected'
  }
}

// Global WebSocket manager instance
export const wsManager = new WebSocketManager()

// React hook for using WebSocket data
export function useWebSocket<T>(type: DataType): {
  data: T | null
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
} {
  const [data, setData] = React.useState<T | null>(null)
  const [status, setStatus] = React.useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')

  React.useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    setStatus(wsManager.getConnectionStatus())
    
    const unsubscribe = wsManager.subscribe(type, (newData: T) => {
      setData(newData)
      setStatus('connected')
    })

    const statusInterval = setInterval(() => {
      setStatus(wsManager.getConnectionStatus())
    }, 1000)

    return () => {
      unsubscribe()
      clearInterval(statusInterval)
    }
  }, [type])

  return { data, status }
}


