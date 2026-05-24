import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initApiInterceptor } from './lib/apiInterceptor';

// Initialize direct client-side Supabase query execution for static file deployments (like Netlify)
initApiInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

