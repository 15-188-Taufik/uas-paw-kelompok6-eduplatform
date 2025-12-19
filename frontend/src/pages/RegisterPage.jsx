import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // [PERBAIKAN] Tambah /api
      const response = await api.post('/api/register', formData);
      if (response.data.success || response.data.status === 'success') {
        alert('Registrasi Berhasil! Silakan Login.');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi Gagal! Silakan coba lagi.');
    }
  };

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
        boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
        border: `1px solid ${colors.border}`
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ marginBottom: '16px' }}>
            <img 
              src="/Logoedu.png" 
              alt="Logo Edu" 
              style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '12px', 
                objectFit: 'cover' 
              }} 
            />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: colors.textDark, margin: '0' }}>Daftar Akun Baru</h2>
          <p style={{ color: colors.textLight, marginTop: '8px', fontSize: '14px' }}>Mulai perjalanan belajar Anda di Focotech</p>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#FFF1F0', 
            color: '#E03131', 
            padding: '12px', 
            borderRadius: '12px', 
            marginBottom: '20px', 
            fontSize: '13px',
            border: '1px solid #FFA8A8'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: colors.textDark }}>Nama Lengkap</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Contoh: Budi Santoso"
              style={inputStyle(colors)}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: colors.textDark }}>Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="nama@email.com"
              style={inputStyle(colors)}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: colors.textDark }}>Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Ketik password rahasia..."
              style={inputStyle(colors)}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: colors.textDark }}>Daftar Sebagai</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              style={inputStyle(colors)}
            >
              <option value="student">Mahasiswa (Student)</option>
              <option value="instructor">Instruktur (Dosen)</option>
            </select>
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
              boxShadow: `0 4px 14px rgba(255, 126, 62, 0.3)`
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Daftar Sekarang
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: colors.textLight }}>
          Sudah punya akun? <a href="/login" style={{ color: colors.primary, textDecoration: 'none', fontWeight: '700' }}>Login di sini</a>
        </p>
      </div>
    </div>
  );
};

const inputStyle = (colors) => ({
  width: '100%', 
  padding: '12px 16px', 
  borderRadius: '12px', 
  border: `1.5px solid ${colors.border}`, 
  boxSizing: 'border-box',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.2s',
  backgroundColor: '#F9F9F9'
});

export default RegisterPage;