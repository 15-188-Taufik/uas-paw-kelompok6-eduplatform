import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active fw-bold text-primary' : 'text-dark';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top border-bottom shadow-sm">
      <div className="container">
        {/* LOGO */}
        <Link className="navbar-brand fw-bold fs-4 text-primary d-flex align-items-center gap-2" to="/">
          <i className="bi bi-mortarboard-fill"></i> EduPlatform
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
            
            {/* 1. Menu Global */}
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/">
                Beranda
              </Link>
            </li>

            {user ? (
              <>
                {/* --- MENU KHUSUS SISWA (Tampilkan Keduanya) --- */}
                {user.role === 'student' && (
                  <>
                    {/* Menu 1: Kursus Saya (Daftar pelajaran) */}
                    <li className="nav-item">
                        <Link className={`nav-link ${isActive('/my-courses')}`} to="/my-courses">
                        Kursus Saya
                        </Link>
                    </li>

                    {/* Menu 2: Dashboard (Statistik & Jadwal) */}
                    <li className="nav-item">
                        <Link className={`nav-link ${isActive('/student-dashboard')}`} to="/student-dashboard">
                        Dashboard
                        </Link>
                    </li>
                  </>
                )}

                {/* --- MENU KHUSUS INSTRUKTUR --- */}
                {/* Menu Khusus INSTRUKTUR */}
                {user.role === 'instructor' && (
                  <>
                    <li className="nav-item">
                      <Link className={`nav-link ${isActive('/instructor-dashboard')}`} to="/instructor-dashboard">
                        Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      {/* Tombol ini sekarang membuka halaman Manajemen Kursus */}
                      <Link className={`nav-link ${isActive('/instructor-courses')}`} to="/instructor-courses">
                        Manajemen Kursus
                      </Link>
                    </li>
                  </>
                )}
                {/* Divider */}
                <li className="nav-item d-none d-lg-block text-muted">|</li>

                {/* Profil Dropdown */}
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle d-flex align-items-center gap-2" 
                    href="#" 
                    role="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center" style={{width: '32px', height: '32px', fontSize: '14px'}}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="d-lg-none d-inline-block fw-bold">{user.name}</span>
                  </a>
                  
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 mt-2">
                    <li><span className="dropdown-header">Halo, <strong>{user.name}</strong></span></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button onClick={handleLogout} className="dropdown-item text-danger d-flex align-items-center gap-2">
                        <i className="bi bi-box-arrow-right"></i> Keluar
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              /* --- MENU TAMU (Belum Login) --- */
              <>
                <li className="nav-item">
                  <Link className="nav-link fw-bold text-dark" to="/login">Masuk</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-primary rounded-pill px-4 fw-bold" to="/register">Daftar Sekarang</Link>
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