import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app'
import './app.css'
import 'bytemd/dist/index.css'
import 'bytemd-plugin-github-alerts/index.css'
import 'github-markdown-css/github-markdown.css'
import 'highlight.js/styles/github.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
