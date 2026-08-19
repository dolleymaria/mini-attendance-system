import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  LogOut,
  ClipboardList,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Employees",
      path: "/employees",
      icon: Users,
    },
    {
      name: "Attendance",
      path: "/attendance",
      icon: CalendarCheck,
    },
  ];

  return (
    <aside className="sidebar">

      <div className="sidebar-brand">
        <div className="brand-icon">
          <ClipboardList size={24} />
        </div>

        <div>
          <h2>Attendance</h2>
          <span>Management</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-title">MENU</p>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">

        <div className="admin-info">
          <div className="admin-avatar">
            {user?.username?.charAt(0).toUpperCase() || "A"}
          </div>

          <div>
            <strong>{user?.username || "Admin"}</strong>
            <span>{user?.role || "ADMIN"}</span>
          </div>
        </div>

        <button
          className="sidebar-logout"
          onClick={logout}
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>
    </aside>
  );
};

export default Sidebar;