'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Plus, X, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { useWebSocket } from '@/lib/websocket'

interface PriceAlert {
  id: string
  price: number
  condition: 'above' | 'below'
  message: string
  active: boolean
  createdAt: string
  triggeredAt?: string
}

interface PriceData {
  price: number
  timestamp: string
}

export default function PriceAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [newAlertPrice, setNewAlertPrice] = useState('')
  const [newAlertCondition, setNewAlertCondition] = useState<'above' | 'below'>('above')
  const [showAddForm, setShowAddForm] = useState(false)
  const [notifications, setNotifications] = useState<string[]>([])
  
  // Use WebSocket for real-time price updates
  const { data: priceData, status } = useWebSocket<PriceData>('price')

  // Load alerts from localStorage on component mount
  useEffect(() => {
    const savedAlerts = localStorage.getItem('tsla-price-alerts')
    if (savedAlerts) {
      try {
        setAlerts(JSON.parse(savedAlerts))
      } catch (error) {
        console.error('Error loading alerts:', error)
      }
    }
  }, [])

  // Save alerts to localStorage whenever alerts change
  useEffect(() => {
    localStorage.setItem('tsla-price-alerts', JSON.stringify(alerts))
  }, [alerts])

  // Check for triggered alerts when price updates
  useEffect(() => {
    if (!priceData) return

    const currentPrice = priceData.price
    const triggeredAlerts: PriceAlert[] = []

    setAlerts(prevAlerts => 
      prevAlerts.map(alert => {
        if (!alert.active || alert.triggeredAt) return alert

        const shouldTrigger = 
          (alert.condition === 'above' && currentPrice >= alert.price) ||
          (alert.condition === 'below' && currentPrice <= alert.price)

        if (shouldTrigger) {
          const triggeredAlert = {
            ...alert,
            active: false,
            triggeredAt: new Date().toISOString()
          }
          triggeredAlerts.push(triggeredAlert)
          return triggeredAlert
        }

        return alert
      })
    )

    // Show notifications for triggered alerts
    triggeredAlerts.forEach(alert => {
      const message = `TSLA ${alert.condition} $${alert.price}: Current price $${currentPrice.toFixed(2)}`
      setNotifications(prev => [...prev, message])
      
      // Request permission and show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('TSLA Price Alert', {
          body: message,
          icon: '/favicon.ico'
        })
      }
      
      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n !== message))
      }, 5000)
    })
  }, [priceData])

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const addAlert = () => {
    const price = parseFloat(newAlertPrice)
    if (isNaN(price) || price <= 0) return

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      price,
      condition: newAlertCondition,
      message: `Alert when TSLA goes ${newAlertCondition} $${price}`,
      active: true,
      createdAt: new Date().toISOString()
    }

    setAlerts(prev => [...prev, newAlert])
    setNewAlertPrice('')
    setShowAddForm(false)
  }

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  const toggleAlert = (id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, active: !alert.active } : alert
      )
    )
  }

  const dismissNotification = (notification: string) => {
    setNotifications(prev => prev.filter(n => n !== notification))
  }

  return (
    <div className="space-y-4">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  {notification}
                </span>
              </div>
              <button
                onClick={() => dismissNotification(notification)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Price Alerts
              </CardTitle>
              <CardDescription>
                Get notified when TSLA reaches your target prices
              </CardDescription>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Alert
            </button>
          </div>

          {/* Real-time price display */}
          {priceData && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={status === 'connected' ? 'success' : 'secondary'}>
                {status === 'connected' ? 'Live' : status}
              </Badge>
              <span className="text-lg font-bold">
                ${priceData.price.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(priceData.timestamp).toLocaleTimeString()}
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Add Alert Form */}
          {showAddForm && (
            <div className="p-4 border rounded-lg mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAlertPrice}
                    onChange={(e) => setNewAlertPrice(e.target.value)}
                    placeholder="250.00"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Condition</label>
                  <select
                    value={newAlertCondition}
                    onChange={(e) => setNewAlertCondition(e.target.value as 'above' | 'below')}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="above">Above</option>
                    <option value="below">Below</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addAlert}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                >
                  Create Alert
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

          {/* Alerts List */}
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No price alerts set. Click "Add Alert" to create one.
              </div>
            ) : (
              alerts.map(alert => {
                const Icon = alert.condition === 'above' ? TrendingUp : TrendingDown
                const isTriggered = !!alert.triggeredAt
                
                return (
                  <div
                    key={alert.id}
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      isTriggered ? 'border-red-200 bg-red-50' :
                      alert.active ? 'border-green-200 bg-green-50' : 
                      'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${
                        isTriggered ? 'text-red-600' :
                        alert.active ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      
                      <div>
                        <div className="font-medium text-sm">
                          ${alert.price.toFixed(2)} {alert.condition}
                        </div>
                        <div className="text-xs text-gray-600">
                          {isTriggered ? (
                            <>Triggered {new Date(alert.triggeredAt!).toLocaleString()}</>
                          ) : (
                            <>Created {new Date(alert.createdAt).toLocaleString()}</>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          isTriggered ? 'destructive' :
                          alert.active ? 'success' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {isTriggered ? 'Triggered' : alert.active ? 'Active' : 'Inactive'}
                      </Badge>
                      
                      {!isTriggered && (
                        <button
                          onClick={() => toggleAlert(alert.id)}
                          className="text-xs px-2 py-1 border rounded hover:bg-gray-100 transition-colors"
                        >
                          {alert.active ? 'Pause' : 'Resume'}
                        </button>
                      )}
                      
                      <button
                        onClick={() => removeAlert(alert.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Notification Permission Status */}
          {'Notification' in window && Notification.permission !== 'granted' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm text-yellow-800">
                <strong>Enable Notifications:</strong> Allow browser notifications to receive alerts even when the page is not active.
                <button
                  onClick={() => Notification.requestPermission()}
                  className="ml-2 underline hover:no-underline"
                >
                  Enable Now
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
