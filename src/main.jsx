// Apply the saved/preferred theme before React mounts to avoid a flash.
(function () {
  try {
    var saved = localStorage.getItem('ll-theme')
    var theme = (saved === 'light' || saved === 'dark')
      ? saved
      : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', theme)
  } catch (e) {}
})()

import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './hooks/useAuthContext'
import { ThemeProvider } from './hooks/useTheme'
import App from './App'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)
