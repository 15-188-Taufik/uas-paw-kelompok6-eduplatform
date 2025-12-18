import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/logoedu.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ STATE USER (REAKTIF)
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  // 🔑 SYNC USER SETIAP PINDAH HALAMAN
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/", { replace: true });
  };

  const isActive = (path) =>
    location.pathname === path
      ? "active fw-bold text-primary"
      : "text-dark";

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top border-bottom shadow-sm">
      <div className="container">
        {/* LOGO */}
        <Link
          className="navbar-brand fw-bold fs-4 text-primary d-flex align-items-center gap-2"
          to="/"
        >
          <img
            src={logo}
            alt="Logo"
            style={{ width: "44px", height: "44px" }}
          />
          <span>EduPlatform</span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-lg-4 gap-2 mt-3 mt-lg-0">
            {/* MENU GLOBAL */}
            <li className="nav-item">
              <Link className={`nav-link ${isActive("/")}`} to="/">
                Beranda
              </Link>
            </li>

            {user ? (
              <>
                {/* STUDENT */}
                {user.role === "student" && (
                  <>
                    <li className="nav-item">
                      <Link
                        className={`nav-link ${isActive("/my-courses")}`}
                        to="/my-courses"
                      >
                        Kursus Saya
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className={`nav-link ${isActive("/student-dashboard")}`}
                        to="/student-dashboard"
                      >
                        Dashboard
                      </Link>
                    </li>
                  </>
                )}

                {/* INSTRUCTOR */}
                {user.role === "instructor" && (
                  <>
                    <li className="nav-item">
                      <Link
                        className={`nav-link ${isActive("/instructor-dashboard")}`}
                        to="/instructor-dashboard"
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className={`nav-link ${isActive("/instructor-courses")}`}
                        to="/instructor-courses"
                      >
                        Manajemen Kursus
                      </Link>
                    </li>
                  </>
                )}

                {/* DIVIDER */}
                <li className="nav-item d-none d-lg-block text-muted">|</li>

                {/* PROFILE */}
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle d-flex align-items-center gap-2"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    <div
                      className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center"
                      style={{ width: 32, height: 32, fontSize: 14 }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </a>

                  <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 mt-2">
                    <li>
                      <span className="dropdown-header">
                        Halo, <strong>{user.name}</strong>
                      </span>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link to="/profile" className="dropdown-item">
                        Profil
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="dropdown-item text-danger"
                      >
                        Keluar
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                {/* GUEST */}
                <li className="nav-item">
                  <Link className="nav-link fw-bold text-dark" to="/login">
                    Masuk
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="btn btn-primary rounded-pill px-4 fw-bold"
                    to="/register"
                  >
                    Daftar Sekarang
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
