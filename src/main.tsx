import { createRoot } from 'react-dom/client';
import '@fontsource-variable/nunito/index.css';
import '@fontsource-variable/material-symbols-outlined/index.css';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <App />
)
