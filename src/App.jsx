import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdmin/SuperAdminDashboard';
import ClientAdminDashboard from './pages/ClientAdmin/ClientAdminDashboard';
import MetaConnect from './pages/ClientAdmin/MetaConnect';
import PrivacyPolicy from './pages/Legal/PrivacyPolicy';
import TermsOfService from './pages/Legal/TermsOfService';
import DataDeletion from './pages/Legal/DataDeletion';
import { Spin } from 'antd';

const PrivateRoute = ({ children, roleRequired }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
  if (!user) return <Navigate to="/" />;
  if (roleRequired && user.role !== roleRequired) {
    return <Navigate to={user?.role === 'SUPER_ADMIN' ? "/superadmin" : "/client"} />;
  }

  return children;
};

const App = () => {
  const tokenParam = new URLSearchParams(window.location.search).get('token');
  if (tokenParam) {
    localStorage.setItem('token', tokenParam);
    window.history.replaceState(null, '', window.location.pathname);
    window.location.reload();
    return null;
  }

  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;

  return (
    <Routes>
      {/* Public Legal & Compliance Pages — Meta requires these to be publicly accessible */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/data-deletion" element={<DataDeletion />} />

      {/* Root route serves as the Login page for unauthenticated users */}
      <Route path="/" element={
        user ? (user.role === 'SUPER_ADMIN' ? <Navigate to="/superadmin" /> : <Navigate to="/client" />) : <Login />
      } />
      
      {/* Fallback login route to redirect to root */}
      <Route path="/login" element={<Navigate to="/" />} />
      
      <Route path="/superadmin/*" element={
        <PrivateRoute roleRequired="SUPER_ADMIN">
          <SuperAdminDashboard />
        </PrivateRoute>
      } />
      
      {/* Route specifically for Meta Connect flow — must be BEFORE /client/* wildcard */}
      <Route path="/client/meta-connect" element={
        <PrivateRoute roleRequired="CLIENT_ADMIN">
          <MetaConnect />
        </PrivateRoute>
      } />
      
      <Route path="/client/*" element={
        <PrivateRoute roleRequired="CLIENT_ADMIN">
          <ClientAdminDashboard />
        </PrivateRoute>
      } />

      {/* Catch-all for undefined routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
