import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const themeColor = '#FF7E3E';

  const isActive = (path) => {
    return location.pathname === path ? 'fw-bold' : '';
  };

  const activeLinkStyle = (path) => {
    return {
      color: location.pathname === path ? themeColor : '#2D2D2D',
      fontSize: '15px'
    };
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top border-bottom shadow-sm" style={{ padding: '10px 0' }}>
      <div className="container">
        
        {/* LOGO & BRAND */}
        <Link 
          className="navbar-brand d-flex align-items-center gap-2" 
          to="/" 
          style={{ textDecoration: 'none' }}
        >
          {/* PERBAIKAN DI SINI: Panggil langsung nama filenya dari folder public */}
          <img 
            src="/Logoedu.png" 
            alt="Logo Edu" 
            style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} 
          />
          <span style={{ 
            color: themeColor, 
            fontWeight: '800', 
            fontSize: '22px', 
            letterSpacing: '-0.5px' 
          }}>
            EduPlatform
          </span>
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
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/" style={activeLinkStyle('/')}>
                Beranda
              </Link>
            </li>

            {user ? (
              <>
                {user.role === 'student' && (
                  <>
                    <li className="nav-item">
                        <Link className={`nav-link ${isActive('/my-courses')}`} to="/my-courses" style={activeLinkStyle('/my-courses')}>
                          Kursus Saya
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link className={`nav-link ${isActive('/student-dashboard')}`} to="/student-dashboard" style={activeLinkStyle('/student-dashboard')}>
                          Dashboard
                        </Link>
                    </li>
                  </>
                )}

                {user.role === 'instructor' && (
                  <>
                    <li className="nav-item">
                      <Link className={`nav-link ${isActive('/instructor-dashboard')}`} to="/instructor-dashboard" style={activeLinkStyle('/instructor-dashboard')}>
                        Dashboard
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className={`nav-link ${isActive('/instructor-courses')}`} to="/instructor-courses" style={activeLinkStyle('/instructor-courses')}>
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