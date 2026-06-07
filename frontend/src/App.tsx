import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Page Imports
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { VerifyEmail } from './pages/VerifyEmail';
import { Dashboard } from './pages/Dashboard';
import { Wallet } from './pages/Wallet';
import { Transfer } from './pages/Transfer';
import { TransactionHistory } from './pages/TransactionHistory';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';

// Guards & Layout
import { PublicRoute, ProtectedRoute, AdminRoute } from './components/RouteGuards';
import { Layout } from './components/Layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          
          {/* Public Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Guest/Auth Routes - Redirects to /dashboard if logged in */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Route>

          {/* User Protected Routes - Redirects to /login if logged out */}
          <Route element={<ProtectedRoute />}>
            <Route 
              path="/dashboard" 
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              } 
            />
            <Route 
              path="/wallet" 
              element={
                <Layout>
                  <Wallet />
                </Layout>
              } 
            />
            <Route 
              path="/transfer" 
              element={
                <Layout>
                  <Transfer />
                </Layout>
              } 
            />
            <Route 
              path="/history" 
              element={
                <Layout>
                  <TransactionHistory />
                </Layout>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <Layout>
                  <Profile />
                </Layout>
              } 
            />
            
            {/* Admin Panel Guards */}
            <Route element={<AdminRoute />}>
              <Route 
                path="/admin" 
                element={
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                } 
              />
            </Route>
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
