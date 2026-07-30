import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app'
import './app.css'
import 'bytemd/dist/index.css'
import 'bytemd-plugin-github-alerts/index.css'
import 'bytemd-plugin-math/styles/katex.css'
import 'bytemd-theme-github/light.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
