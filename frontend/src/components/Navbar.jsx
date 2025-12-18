import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  }, []);

  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Warna Tema
  const themeColor = '#FF7E3E';
  const bgColor = '#FFFFFF'; // Warna Background Putih

  const [searchHovered, setSearchHovered] = useState(false);

  const isActive = (path) => (location.pathname === path ? 'fw-bold' : '');

  const activeLinkStyle = (path) => ({
    color: location.pathname === path ? themeColor : '#2D2D2D',
    fontSize: '15px',
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchTerm.trim();
    navigate(q ? `/?search=${encodeURIComponent(q)}` : '/');
  };

  return (
    // HAPUS 'bg-white' dan tambahkan backgroundColor di style
    <nav className="navbar navbar-expand-lg navbar-light sticky-top border-bottom shadow-sm" 
         style={{ padding: '12px 0', backgroundColor: bgColor, margin: 0 }}>
      <div className="container">

        {/* LOGO & BRAND */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/" style={{ textDecoration: 'none', minWidth: '160px' }}>
          <img
            src="/Logoedu.png"
            alt="Logo Edu"
            style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
          />
          <span style={{ color: themeColor, fontWeight: '800', fontSize: '22px', letterSpacing: '-0.5px', fontFamily: 'Poppins' }}>
            EduPlatform
          </span>
        </Link>

        {/* SEARCH BAR (DESKTOP) */}
        <form
          onSubmit={handleSearchSubmit}
          className="d-none d-lg-flex align-items-center mx-4"
          style={{ flexGrow: 1, maxWidth: '800px' }}
        >
          <div
            className="w-100 d-flex align-items-center"
            onMouseEnter={() => setSearchHovered(true)}
            onMouseLeave={() => setSearchHovered(false)}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '50px',
              border: searchHovered ? `2px solid ${themeColor}` : '1px solid #EAEAEA',
              padding: '10px 16px',
              boxShadow: searchHovered ? `0 4px 12px rgba(255, 126, 62, 0.15)` : '0 2px 5px rgba(0,0,0,0.02)',
              transition: 'all 0.3s ease',
              cursor: 'text'
            }}
          >
            <i className="bi bi-search" style={{ fontSize: '18px', color: searchHovered ? themeColor : '#9CA3AF', transition: 'color 0.3s ease', marginRight: '12px', flexShrink: 0 }}></i>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control border-0 bg-transparent p-0"
              placeholder="Cari kursus... (Tekan Enter)"
              style={{ outline: 'none', boxShadow: 'none', fontSize: '15px', color: '#4B5563', height: '100%', fontFamily: 'Poppins' }}
            />
          </div>
        </form>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          {/* SEARCH (MOBILE) */}
          <form onSubmit={handleSearchSubmit} className="d-lg-none mt-3 mb-3">
            <div className="input-group">
                <span className="input-group-text bg-white border-end-0 rounded-start-pill">
                    <i className="bi bi-search text-muted"></i>
                </span>
                <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control border-start-0 rounded-end-pill bg-white"
                    placeholder="Cari kursus..."
                    style={{ fontFamily: 'Poppins' }}
                />
            </div>
          </form>

          <ul className="navbar-nav ms-auto align-items-center gap-lg-4 gap-2 mt-3 mt-lg-0">
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/')}`} 
                to="/" 
                style={{
                  ...activeLinkStyle('/'),
                  padding: '8px 12px',
                  borderRadius: '50px',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#FFF5F1';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                Beranda
              </Link>
            </li>

            {user ? (
              <>
                {user.role === 'student' && (
                  <>
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${isActive('/my-courses')}`} 
                        to="/my-courses" 
                        style={{
                          ...activeLinkStyle('/my-courses'),
                          padding: '8px 12px',
                          borderRadius: '50px',
                          transition: 'all 0.2s ease',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#FFF5F1';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        Kursus Saya
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${isActive('/timeline')}`} 
                        to="/timeline" 
                        style={{
                          ...activeLinkStyle('/timeline'),
                          padding: '8px 12px',
                          borderRadius: '50px',
                          transition: 'all 0.2s ease',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#FFF5F1';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        Timeline
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${isActive('/student-dashboard')}`} 
                        to="/student-dashboard" 
                        style={{
                          ...activeLinkStyle('/student-dashboard'),
                          padding: '8px 12px',
                          borderRadius: '50px',
                          transition: 'all 0.2s ease',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#FFF5F1';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        Dashboard
                      </Link>
                    </li>
                  </>
                )}

                {user.role === 'instructor' && (
                  <>
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${isActive('/instructor-dashboard')}`} 
                        to="/instructor-dashboard" 
                        style={{
                          ...activeLinkStyle('/instructor-dashboard'),
                          padding: '8px 12px',
                          borderRadius: '50px',
                          transition: 'all 0.2s ease',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#FFF5F1';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${isActive('/instructor-courses')}`} 
                        to="/instructor-courses" 
                        style={{
                          ...activeLinkStyle('/instructor-courses'),
                          padding: '8px 12px',
                          borderRadius: '50px',
                          transition: 'all 0.2s ease',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#FFF5F1';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        Manajemen Kursus
                      </Link>
                    </li>
                  </>
                )}

                <li className="nav-item d-none d-lg-block text-muted">|</li>

                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle d-flex align-items-center gap-2" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <div className="text-white rounded-circle d-flex justify-content-center align-items-center fw-bold" style={{ width: '36px', height: '36px', backgroundColor: themeColor, fontSize: '14px' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-2">
                    <li><span className="dropdown-header" style={{ fontFamily: 'Poppins' }}>Halo, <strong>{user.name}</strong></span></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button onClick={handleLogout} className="dropdown-item text-danger d-flex align-items-center gap-2" style={{ fontFamily: 'Poppins' }}>
                        <i className="bi bi-box-arrow-right"></i> Keluar
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="btn px-4 fw-bold shadow-sm text-white" to="/login" style={{ backgroundColor: themeColor, borderRadius: '12px', padding: '10px 25px' }}>
                  Masuk
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;