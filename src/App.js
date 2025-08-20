// anamika-webdev/eptw/EPTW-2abc7ffedffb41e2c4abec468f553629a3b64530/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
// This line is corrected to use PascalCase 'Login'
import Login from './components/Login'; 
import AdminDashboard from './pages/AdminDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import { useAuth } from './context/AuthContext';
import './App.css';

const LoginPage = () => {
  const { user } = useAuth();

  if (user) {
    switch (user.user_type) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'supervisor':
        return <Navigate to="/supervisor" replace />;
      case 'worker':
        return <Navigate to="/worker" replace />;
      default:
        return <Login />;
    }
  }

  return <Login />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div>
                    <Header />
                    <AdminDashboard />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/supervisor" 
              element={
                <ProtectedRoute allowedRoles={['supervisor']}>
                  <div>
                    <Header />
                    <SupervisorDashboard />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/worker" 
              element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <div>
                    <Header />
                    <WorkerDashboard />
                  </div>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;