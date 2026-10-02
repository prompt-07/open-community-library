import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n.js';
import './index.css';
import App from './App.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </SettingsProvider>
  </StrictMode>
);
