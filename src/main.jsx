import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // Ensure this points to your App component file
import './index.css'      // Ensure this line is present and imports the CSS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
