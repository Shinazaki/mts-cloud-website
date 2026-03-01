import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { Servers } from './pages/Servers/Servers';
import { ServerDetails } from './pages/Servers/ServerDetails';
import { ServerConfig } from './pages/Servers/ServerConfig';
import { CreateServer } from './pages/Servers/CreateServer';
import { Billing } from './pages/Billing/Billing';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';

import { Settings } from './pages/Settings/Settings';
import { Support } from './pages/Support/Support';
import { Backups, Monitoring, Traffic, APIPage, QA, WhatsNew } from './pages/SecondaryPages/SecondaryPages';

import { useAuth } from './hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSettingsStore } from './store/settingsStore';

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/servers" replace />;
  return <>{children}</>;
};

const ThemeSync = () => {
  const theme = useSettingsStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      return;
    }

    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) root.setAttribute('data-theme', 'dark');
      else root.removeAttribute('data-theme');
      return;
    }

    root.removeAttribute('data-theme');
  }, [theme]);

  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSync />
      <BrowserRouter>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            </Route>

            <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/servers" replace />} />
              <Route path="servers" element={<Servers />} />
              <Route path="servers/:id" element={<ServerDetails />} />
              <Route path="servers/:id/config" element={<ServerConfig />} />
              <Route path="servers/create" element={<CreateServer />} />
              <Route path="backups" element={<Backups />} />
              <Route path="monitoring" element={<Monitoring />} />
              <Route path="traffic" element={<Traffic />} />

              <Route path="billing" element={<Billing />} />
              <Route path="support" element={<Support />} />
              <Route path="settings" element={<Settings />} />
              <Route path="api" element={<APIPage />} />
              <Route path="qa" element={<QA />} />
              <Route path="whats-new" element={<WhatsNew />} />
            </Route>
          </Routes>
        </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
