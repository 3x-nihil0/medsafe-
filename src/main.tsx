import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { isNativeApp } from './lib/platform.ts';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// Browser/PWA only: the native APK ships its own assets and must not be
// cached by a service worker (a stale cache would survive app updates).
if ('serviceWorker' in navigator && typeof window !== 'undefined' && !isNativeApp()) {
  window.addEventListener('load', () => {
    // BASE_URL keeps this correct at a domain root (Netlify) and under a
    // sub-path (GitHub Pages project sites).
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(err => {
      console.warn('Service worker registration note:', err);
    });
  });
}

