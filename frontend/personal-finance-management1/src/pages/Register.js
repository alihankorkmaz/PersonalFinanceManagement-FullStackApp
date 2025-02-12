import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [registrationKey, setRegistrationKey] = useState("");
  const [currentKey, setCurrentKey] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current registration key from the server
    const fetchCurrentKey = async () => {
      try {
        const response = await axios.get("https://localhost:7050/api/Admin/current-key");
        setCurrentKey(response.data.key); // Store the current key for validation
      } catch (error) {
        console.error("Error fetching current key:", error);
      }
    };

    fetchCurrentKey();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Validate registration key for admin
    if (isAdmin && registrationKey !== currentKey) {
      alert("Invalid registration key for admin.");
      setIsLoading(false);
      return;
    }

    const endpoint = isAdmin
      ? "https://localhost:7050/api/AdminRegister/register"
      : "https://localhost:7050/api/UserRegister/register";

    try {
      const response = await axios.post(endpoint, {
        name,
        email,
        password,
      });

      if (response.data.message) {
        setSuccessMessage(response.data.message);
        setName("");
        setEmail("");
        setPassword("");
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Registration failed", error);
      setErrorMessage(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <i className="fas fa-user-plus"></i>
          </div>
          <h1>Create Account</h1>
          <p className="text-muted">Register as {isAdmin ? 'Admin' : 'User'}</p>
        </div>

        {successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-user me-2"></i>Full Name
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-envelope me-2"></i>Email
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-lock me-2"></i>Password
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isAdmin && (
            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-key me-2"></i>Registration Key
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter registration key"
                value={registrationKey}
                onChange={(e) => setRegistrationKey(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="isAdmin"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="isAdmin">
                Register as Administrator
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="mb-0">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="btn btn-link p-0"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
