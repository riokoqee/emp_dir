import "./MainLayout.css";
import RightSidebar from "../Sidebar/Sidebar";
import { useAuth } from "../../context/AuthContext";
import "../../pages/LoginPage.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();

  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="layout-root">
      <header className="layout-header">
        <Link to="/" className="layout-logo">
          <img src="/src/assets/fc_logo.svg" className="fc-logo" alt="Финцентр" />
        </Link>
        <div className="layout-user">
            {user ? (
                <div className="profile-wrapper">
                <div
                    className="profile-display"
                    onClick={() => setOpenMenu(!openMenu)}
                >
                    <span className="profile-name">{user.name}</span>
                    <span className="profile-role">({user.role})</span>
                    <span className={`profile-arrow ${openMenu ? "open" : ""}`}>▼</span>
                </div>

                {openMenu && (
                    <div className="profile-menu">
                    {user.role === "ADMIN" && (
                        <div
                        className="profile-menu-item"
                        onClick={() => {
                            navigate("/admin");
                            setOpenMenu(false);
                        }}
                        >
                        ⚙ Админ-панель
                        </div>
                    )}
                    {user.role === "DEPT_ADMIN" && (
                        <div
                        className="profile-menu-item"
                        onClick={() => {
                            navigate(`/admin/department/${user.departmentId}`);
                            setOpenMenu(false);
                        }}
                        >
                        ⚙ Админка отдела
                        </div>
                    )}

                    <div
                        className="profile-menu-item logout"
                        onClick={() => {
                        logout();
                        setOpenMenu(false);
                        }}
                    >
                        🚪 Выйти
                    </div>
                    </div>
                )}
                </div>
            ) : (
                <a href="/login" className="btn-primary">Войти</a>
            )}
        </div>
      </header>

      <div className="layout-body">
        <aside className="layout-sidebar">
            <RightSidebar />
        </aside>
        <main className="layout-content">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
