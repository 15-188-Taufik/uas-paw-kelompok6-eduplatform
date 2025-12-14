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
    try {
      const response = await api.post('/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        const target = response.data.user.role === 'instructor' ? '/instructor-dashboard' : '/student-dashboard';
        navigate(target);
      }
    } catch (err) {
      // ... di dalam handleLogin
try {
  const response = await api.post('/login', { email, password });
  // ... (kode sukses)
} catch (err) {
  console.error(err); // Lihat detail error di Console Browser (F12)

  if (err.response) {
    // Jika server merespon dengan kode error (misal 401 Unauthorized)
    if (err.response.status === 401) {
         setError('Password atau Email salah.');
    } else {
         setError(`Terjadi kesalahan: ${err.response.data.error || err.response.statusText}`);
    }
  } else if (err.request) {
    // Jika tidak ada respon dari server (Backend mati?)
    setError('Gagal terhubung ke server. Pastikan Backend berjalan.');
  } else {
    setError('Terjadi kesalahan sistem.');
  }
}
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#f3f4f6' }}>
      <div className="card-modern p-4 p-md-5" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="text-center mb-4">
          <h3 className="fw-bold text-dark">Selamat Datang Kembali</h3>
          <p className="text-muted">Silakan masuk ke akun Anda</p>
        </div>

        {error && <div className="alert alert-danger py-2 small border-0 bg-danger-subtle text-danger">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary">EMAIL</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between">
                <label className="form-label small fw-bold text-secondary">PASSWORD</label>
                <a href="#" className="small text-decoration-none" style={{color: 'var(--primary-color)'}}>Lupa Password?</a>
            </div>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 fs-6">
            Masuk
          </button>
        </form>

        <div className="text-center mt-4">
          <small className="text-muted">
            Belum punya akun? <Link to="/register" className="fw-bold text-decoration-none" style={{ color: 'var(--primary-color)' }}>Buat Akun Baru</Link>
          </small>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;