import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app'
import './app.css'
import 'bytemd/dist/index.css'
import 'bytemd-plugin-github-alerts/index.css'
import 'katex/dist/katex.css'
import 'bytemd-theme-github'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
