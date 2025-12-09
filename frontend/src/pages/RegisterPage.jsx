import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' // Default role kita set ke student
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fungsi untuk menangani perubahan input form
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Fungsi saat tombol daftar diklik
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); // Reset error sebelum mencoba
    
    try {
      // Mengirim data ke Backend: POST /api/register
      const response = await api.post('/register', formData);
      
      if (response.data.success) {
        alert('Registrasi Berhasil! Silakan Login dengan akun baru Anda.');
        navigate('/login'); // Arahkan pengguna ke halaman login
      }
    } catch (err) {
      console.error(err);
      // Tampilkan pesan error dari backend jika ada, atau pesan umum
      setError(err.response?.data?.error || 'Registrasi Gagal! Silakan coba lagi.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', color: '#bc2131' }}>Daftar Akun Baru</h2>
      
      {error && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nama Lengkap:</label>
          <input 
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Contoh: Budi Santoso"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="nama@email.com"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password:</label>
          <input 
            type="password" 
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Ketik password rahasia..."
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Daftar Sebagai:</label>
          <select 
            name="role" 
            value={formData.role} 
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', backgroundColor: 'white' }}
          >
            <option value="student">Mahasiswa (Student)</option>
            <option value="instructor">Instruktur (Dosen)</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          style={{ 
            padding: '12px', 
            backgroundColor: '#bc2131', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            fontSize: '1rem', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Daftar Sekarang
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.9rem' }}>
        Sudah punya akun? <a href="/login" style={{ color: '#bc2131', textDecoration: 'none', fontWeight: 'bold' }}>Login di sini</a>
      </p>
    </div>
  );
};

export default RegisterPage;