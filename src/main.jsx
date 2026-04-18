import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Capacitor } from '@capacitor/core'
import { refreshGoogleAuth } from './services/nativeAuth'
import { LocalNotifications } from '@capacitor/local-notifications'

// Handle app resume for Google Sign-In
if (Capacitor.isNativePlatform()) {
  import('@capacitor/app').then(({ App }) => {
    App.addListener('appStateChange', async ({ isActive }) => {
      if (isActive) {
        await refreshGoogleAuth();
      }
    });
  });
  
  // Request notification permission
  LocalNotifications.requestPermissions().catch(console.error);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
