'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration)
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New content is available, refresh the page
                    if (confirm('New version available! Refresh to update?')) {
                      window.location.reload()
                    }
                  }
                })
              }
            })
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError)
          })
      })
    }

    // PWA install prompt
    let deferredPrompt: any
    
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      deferredPrompt = e
      
      // Show install button or banner
      showInstallPromotion()
    })

      window.addEventListener('appinstalled', (evt) => {
        console.log('App was installed')
        hideInstallPromotion()
      })
    }

    function showInstallPromotion() {
      const installBanner = document.createElement('div')
      installBanner.id = 'install-banner'
      installBanner.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: white;
          padding: 12px 16px;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>📱</span>
            <span>Install TSLA Options Tracker for quick access</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="install-btn" style="
              background: rgba(255,255,255,0.2);
              border: 1px solid rgba(255,255,255,0.3);
              color: white;
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 12px;
              cursor: pointer;
            ">Install</button>
            <button id="dismiss-btn" style="
              background: transparent;
              border: none;
              color: white;
              padding: 6px;
              cursor: pointer;
              font-size: 18px;
            ">×</button>
          </div>
        </div>
      `
      
      document.body.appendChild(installBanner)
      
      // Add event listeners
      document.getElementById('install-btn')?.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt()
          const { outcome } = await deferredPrompt.userChoice
          console.log(`User response to the install prompt: ${outcome}`)
          deferredPrompt = null
          hideInstallPromotion()
        }
      })
      
      document.getElementById('dismiss-btn')?.addEventListener('click', () => {
        hideInstallPromotion()
        // Don't show again for this session
        sessionStorage.setItem('install-prompt-dismissed', 'true')
      })
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        hideInstallPromotion()
      }, 10000)
    }

    function hideInstallPromotion() {
      const banner = document.getElementById('install-banner')
      if (banner) {
        banner.remove()
      }
    }

    // Don't show if already dismissed this session
    if (sessionStorage.getItem('install-prompt-dismissed')) {
      return
    }

  }, [])

  return null
}
