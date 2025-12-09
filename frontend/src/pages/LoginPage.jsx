import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Tembak API Login Backend
      const response = await api.post('/login', { email, password });
      
      if (response.data.success) {
        // Simpan data user ke memori browser (localStorage)
        localStorage.setItem('user', JSON.stringify(response.data.user));
        alert('Login Berhasil!');
        navigate('/'); // Pindah ke Home
      }
    } catch (err) {
      console.error(err);
      setError('Email atau Password salah!');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Email:</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <button type="submit" style={{ padding: '10px', backgroundColor: '#bc2131', color: 'white', border: 'none', cursor: 'pointer' }}>
          Masuk
        </button>
      </form>
    </div>
  );
};

export default LoginPage;