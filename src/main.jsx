import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'sonner'
import { initializeSampleActivities } from './utils/activityUtils.js'

// Initialize sample activities
initializeSampleActivities()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster position="top-right" />
  </StrictMode>,
)
