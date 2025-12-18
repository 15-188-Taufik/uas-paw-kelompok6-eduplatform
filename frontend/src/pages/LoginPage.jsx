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

  const handleGoogleLogin = () => {
    // Logika login google nanti di sini (misal menggunakan Firebase atau OAuth2)
    alert("Fitur Login Google akan segera tersedia!");
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
      fontFamily: "'Poppins', sans-serif" 
    }}>
      {/* Inject Font Poppins */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');`}
      </style>

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
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.textDark, margin: '0' }}>Selamat Datang Kembali</h2>
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
            {/* Bagian Lupa Password Dihapus, label dibuat block biasa */}
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: colors.textDark }}>PASSWORD</label>
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
              fontWeight: '600', 
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

        {/* DIVIDER ATAU PEMBATAS */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', color: colors.textLight }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#EAEAEA' }}></div>
            <span style={{ padding: '0 10px', fontSize: '12px' }}>atau masuk dengan</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#EAEAEA' }}></div>
        </div>

        {/* TOMBOL LOGIN GOOGLE */}
        <button 
            type="button"
            onClick={handleGoogleLogin}
            style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'white',
                border: '1px solid #EAEAEA',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                transition: 'background 0.2s',
                color: colors.textDark,
                fontWeight: '500',
                fontSize: '14px'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
            {/* Google Icon SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Masuk dengan Google
        </button>

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
  boxSizing: 'border-box',
  fontFamily: "'Poppins', sans-serif"
});

export default LoginPage;