import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LogIn, Lock, User } from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, isAuthenticated } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!username || !password) {
      setError("Please enter username and password.");
      return;
    }

    try {
      setLoading(true);

      await login(username, password);

      const destination =
        location.state?.from?.pathname || "/dashboard";

      navigate(destination, { replace: true });
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
          "Invalid username or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">
          <LogIn size={28} />
        </div>

        <h1>Attendance Management</h1>

        <p className="login-subtitle">
          Admin Portal
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>

            <div className="input-wrapper">
              <User size={18} />

              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>

            <div className="input-wrapper">
              <Lock size={18} />

              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="login-footer">
          Mini Attendance Management System
        </p>
      </div>
    </div>
  );
};

export default Login;