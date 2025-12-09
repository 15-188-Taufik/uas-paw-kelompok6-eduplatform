import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={{ 
      display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', 
      backgroundColor: '#bc2131', color: 'white', alignItems: 'center', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>EduPlatform</Link>
      </h2>
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
        
        {user ? (
          <>
            {/* Menu Khusus Student */}
            {user.role === 'student' && (
                <Link to="/my-courses" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
                Kursus Saya
                </Link>
            )}

            {/* Menu Khusus Instructor */}
            {user.role === 'instructor' && (
                <Link to="/instructor-dashboard" style={{ color: '#fffbeb', textDecoration: 'none', fontWeight: 'bold', border: '1px solid white', padding: '5px 10px', borderRadius: '4px' }}>
                Dashboard Instruktur
                </Link>
            )}

            <span style={{ fontWeight: 'normal', opacity: 0.8 }}>|</span>
            <span style={{ fontWeight: 'bold' }}>Halo, {user.name}</span>
            <button 
              onClick={handleLogout}
              style={{ background: 'white', color: '#bc2131', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/register" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Register</Link>
            <Link to="/login" style={{ backgroundColor: 'white', color: '#bc2131', padding: '8px 15px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;