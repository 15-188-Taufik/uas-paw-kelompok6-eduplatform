import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        const target = response.data.user.role === 'instructor' ? '/instructor-dashboard' : '/student-dashboard';
        navigate(target);
      }
    } catch (err) {
      console.error(err);
      if (err.response) {
        if (err.response.status === 401) {
          setError('Password atau Email salah.');
        } else {
          setError(`Terjadi kesalahan: ${err.response.data.error || err.response.statusText}`);
        }
      } else if (err.request) {
        setError('Gagal terhubung ke server. Pastikan Backend berjalan.');
      } else {
        setError('Terjadi kesalahan sistem.');
      }
    }
  };

  // Tema Warna Focotech
  const colors = {
    primary: '#FF7E3E',
    background: '#FDF8F4',
    white: '#FFFFFF',
    textDark: '#2D2D2D',
    textLight: '#7A7A7A',
    border: '#EAEAEA'
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: colors.background, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
      fontFamily: "'Inter', 'Segoe UI', sans-serif" 
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '450px', 
        backgroundColor: colors.white, 
        padding: '40px', 
        borderRadius: '24px', 
        boxShadow: '0 10px 25px rgba(255, 126, 62, 0.05)',
        border: `1px solid ${colors.border}`
      }}>
        
        {/* Header Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ marginBottom: '16px' }}>
            <img 
              src="/Logoedu.png" 
              alt="Logo Edu" 
              style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} 
            />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: colors.textDark, margin: '0' }}>Selamat Datang Kembali</h2>
          <p style={{ color: colors.textLight, marginTop: '8px', fontSize: '14px' }}>Silakan masuk ke akun Anda</p>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#FFF1F0', 
            color: '#E03131', 
            padding: '12px', 
            borderRadius: '12px', 
            marginBottom: '20px', 
            fontSize: '13px',
            border: '1px solid #FFA8A8',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: colors.textDark }}>EMAIL</label>
            <input 
              type="email" 
              className="form-control"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle(colors)}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontWeight: '600', fontSize: '13px', color: colors.textDark }}>PASSWORD</label>
              <a href="#" style={{ fontSize: '12px', color: colors.primary, textDecoration: 'none', fontWeight: '600' }}>Lupa Password?</a>
            </div>
            <input 
              type="password" 
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle(colors)}
            />
          </div>

          <button 
            type="submit" 
            style={{ 
              padding: '14px', 
              backgroundColor: colors.primary, 
              color: 'white', 
              border: 'none', 
              borderRadius: '14px', 
              fontSize: '16px', 
              fontWeight: '700', 
              cursor: 'pointer',
              marginTop: '10px',
              transition: 'all 0.2s ease',
              boxShadow: `0 8px 20px rgba(255, 126, 62, 0.2)`
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Masuk
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <small style={{ color: colors.textLight, fontSize: '14px' }}>
            Belum punya akun? <Link to="/register" style={{ color: colors.primary, textDecoration: 'none', fontWeight: '700' }}>Buat Akun Baru</Link>
          </small>
        </div>
      </div>
    </div>
  );
};

// Helper style untuk input
const inputStyle = (colors) => ({
  width: '100%', 
  padding: '12px 16px', 
  borderRadius: '12px', 
  border: `1.5px solid ${colors.border}`, 
  fontSize: '14px',
  outline: 'none',
  backgroundColor: '#FAFAFA',
  boxSizing: 'border-box'
});

export default LoginPage;