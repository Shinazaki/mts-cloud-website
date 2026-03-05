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
import { CorporateAdmin } from './pages/CorporateAdmin/CorporateAdmin';
import { SuperAdmin } from './pages/SuperAdmin/SuperAdmin';

import { useAuth } from './hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSettingsStore } from './store/settingsStore';
import type { UserRole } from './types/auth';

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Route accessible only to specific roles
const RoleRoute = ({ children, roles }: { children: React.ReactNode; roles: UserRole[] }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // Support both roles array (from API) and legacy single role
  const userRoles = user?.roles?.map(r => r.role)
    ?? (user?.role ? [user.role] : []);
  const isAdmin = userRoles.includes('admin');
  if (!isAdmin && !roles.some(r => userRoles.includes(r))) {
    return <Navigate to="/servers" replace />;
  }
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    const userRoles = user?.roles?.map(r => r.role) ?? (user?.role ? [user.role] : []);
    return <Navigate to={userRoles.includes('admin') ? '/admin' : '/servers'} replace />;
  }
  return <>{children}</>;
};

// Redirects to the right home based on role (used for the index route)
const HomeRedirect = () => {
  const { user } = useAuth();
  const userRoles = user?.roles?.map(r => r.role) ?? (user?.role ? [user.role] : []);
  if (userRoles.includes('admin')) return <Navigate to="/admin" replace />;
  if (userRoles.some(r => r === 'corporation_admin' || r === 'admin-corporation'))
    return <Navigate to="/corporate-admin" replace />;
  return <Navigate to="/servers" replace />;
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
              <Route index element={<HomeRedirect />} />
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

              {/* Corporate admin panel */}
              <Route path="corporate-admin" element={
                <RoleRoute roles={['admin-corporation']}>
                  <CorporateAdmin />
                </RoleRoute>
              } />

              {/* Super admin panel */}
              <Route path="admin" element={
                <RoleRoute roles={['admin']}>
                  <SuperAdmin />
                </RoleRoute>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
