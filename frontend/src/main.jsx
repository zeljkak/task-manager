import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import 'bootstrap/dist/css/bootstrap.css'
import './index.css'
import App from './App.jsx'
import {AuthProvider} from "./context/AuthContext.jsx";
import {NotificationProvider} from "./context/NotificationContext.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
