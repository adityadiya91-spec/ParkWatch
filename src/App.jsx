import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './AppContext.jsx';
import { useAppContext } from './useAppContext.js';
import Layout from './Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount';
import CitizenLogin from './pages/CitizenLogin';
import AdminLogin from './pages/AdminLogin';
import Home from './pages/Home';
import Reporting from './pages/Reporting';
import Track from './pages/Track';
import Map from './pages/Map';
import Dashboard from './pages/Dashboard';
import AdminReportView from './pages/AdminReportView';
import Leaderboard from './pages/Leaderboard';
import DataPortal from './pages/DataPortal';
import Profile from './pages/Profile';
import './styles.css';

const RequireAuth = ({ children, requiredRole }) => {
  const { authenticated, role } = useAppContext();
  if (!authenticated) return <Navigate to="/" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/citizen-login" element={<CitizenLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/home" element={<RequireAuth requiredRole="Citizen"><Home /></RequireAuth>} />
            <Route path="/reporting" element={<RequireAuth requiredRole="Citizen"><Reporting /></RequireAuth>} />
            <Route path="/track" element={<RequireAuth requiredRole="Citizen"><Track /></RequireAuth>} />
            <Route path="/leaderboard" element={<RequireAuth requiredRole="Citizen"><Leaderboard /></RequireAuth>} />
            <Route path="/dashboard" element={<RequireAuth requiredRole="Admin"><Dashboard /></RequireAuth>} />
            <Route path="/admin/report/:id" element={<RequireAuth requiredRole="Admin"><AdminReportView /></RequireAuth>} />
            <Route path="/map/:lat/:lng" element={<RequireAuth requiredRole="Admin"><Map /></RequireAuth>} />
            <Route path="/map" element={<RequireAuth requiredRole="Admin"><Map /></RequireAuth>} />
            <Route path="/data-portal" element={<RequireAuth requiredRole="Admin"><DataPortal /></RequireAuth>} />          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;