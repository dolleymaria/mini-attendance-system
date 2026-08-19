import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Building2,
  RefreshCw,
  LogOut,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [statistics, setStatistics] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    departmentWiseCount: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardStatistics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dashboard/statistics");

      setStatistics(response.data);
    } catch (error) {
      console.error("Dashboard error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStatistics();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const cards = [
    {
      title: "Total Employees",
      value: statistics.totalEmployees,
      icon: Users,
    },
    {
      title: "Active Employees",
      value: statistics.activeEmployees,
      icon: UserCheck,
    },
    {
      title: "Present Today",
      value: statistics.presentToday,
      icon: UserCheck,
    },
    {
      title: "Absent Today",
      value: statistics.absentToday,
      icon: UserX,
    },
  ];

  return (
    <div className="dashboard-page">

      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Welcome back, {user?.username || "Admin"}
          </p>
        </div>

        <div className="dashboard-actions">
          <button
            className="refresh-button"
            onClick={fetchDashboardStatistics}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {/* Statistics */}
      <section className="statistics-grid">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              className="stat-card"
              key={card.title}
            >
              <div className="stat-card-content">
                <div>
                  <p>{card.title}</p>

                  <h2>
                    {loading ? "..." : card.value}
                  </h2>
                </div>

                <div className="stat-icon">
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Department Section */}
      <section className="department-section">

        <div className="section-header">
          <div>
            <h2>Department-wise Employees</h2>
            <p>
              Number of employees in each department
            </p>
          </div>

          <Building2 size={24} />
        </div>

        {loading ? (
          <div className="loading-state">
            Loading departments...
          </div>
        ) : statistics.departmentWiseCount.length === 0 ? (
          <div className="empty-state">
            No department data available.
          </div>
        ) : (
          <div className="department-list">
            {statistics.departmentWiseCount.map(
              (department) => (
                <div
                  className="department-row"
                  key={department.department}
                >
                  <div>
                    <strong>
                      {department.department}
                    </strong>

                    <div className="progress-container">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${
                            (department.count /
                              statistics.totalEmployees) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <span className="department-count">
                    {department.count}
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </section>

    </div>
  );
};

export default Dashboard;