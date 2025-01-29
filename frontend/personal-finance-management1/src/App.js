import React from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

const NotFound = () => (
  <div className="auth-container">
    <div className="auth-card text-center">
      <div className="auth-header">
        <div className="auth-logo">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h1>404 - Page Not Found</h1>
        <p className="text-muted">The page you're looking for does not exist.</p>
      </div>
      <div className="auth-footer">
        <Link to="/login" className="btn btn-primary">
          Go to Login
        </Link>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Dashboard routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
