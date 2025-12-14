import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
        navigate('/login');
        return;
    }

    const fetchData = async () => {
      try {
        // Mengambil data kursus REAL dari database
        const response = await api.get(`/students/${user.id}/courses`);
        setCourses(response.data.courses);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, user.id]);

  // Logika Statistik (Berdasarkan Data Asli)
  const totalCourses = courses.length;
  // Asumsi: Backend belum kirim field 'progress', jadi kita hitung manual 0 dulu jika null
  // Nanti jika fitur progress di backend sudah siap, angka ini akan otomatis jalan.
  const completedCourses = courses.filter(c => (c.progress || 0) === 100).length;
  const activeCourses = totalCourses - completedCourses;
  
  // Mencari kursus yang terakhir dibuka (logic sederhana: yang progressnya > 0 tapi belum 100)
  // Jika tidak ada, ambil kursus pertama sebagai rekomendasi.
  const lastActiveCourse = courses.find(c => (c.progress || 0) > 0 && (c.progress || 0) < 100) || courses[0];

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  return (
    <div className="min-vh-100 py-4" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-3">
          <div>
            <h2 className="fw-bold text-dark mb-1">Dashboard</h2>
            <p className="text-muted mb-0">
              Halo, <span className="text-primary fw-bold">{user.name}</span>! Siap belajar hari ini?
            </p>
          </div>
          {/* Tanggal Hari Ini (Realtime Browser) */}
          <div className="text-end d-none d-md-block bg-white px-3 py-2 rounded shadow-sm border">
            <span className="fw-bold text-dark">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* 1. KARTU STATISTIK (Data Real dari API) */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100 p-3" style={{ borderRadius: '16px' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                  <i className="bi bi-journal-bookmark-fill fs-3"></i>
                </div>
                <div>
                  <h2 className="fw-bold mb-0">{totalCourses}</h2>
                  <small className="text-muted fw-semibold">Total Kursus</small>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100 p-3" style={{ borderRadius: '16px' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle text-warning">
                  <i className="bi bi-clock-history fs-3"></i>
                </div>
                <div>
                  <h2 className="fw-bold mb-0">{activeCourses}</h2>
                  <small className="text-muted fw-semibold">Sedang Dipelajari</small>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100 p-3" style={{ borderRadius: '16px' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success">
                  <i className="bi bi-trophy-fill fs-3"></i>
                </div>
                <div>
                  <h2 className="fw-bold mb-0">{completedCourses}</h2>
                  <small className="text-muted fw-semibold">Selesai</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. REKOMENDASI LANJUT BELAJAR (Hanya tampil jika ada kursus) */}
        <h5 className="fw-bold text-dark mb-3">Lanjutkan Pembelajaran</h5>
        
        {lastActiveCourse ? (
          <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
            <div className="row g-0 align-items-center">
              <div className="col-md-5">
                <img 
                  src={lastActiveCourse.thumbnail_url || 'https://via.placeholder.com/500x300?text=Course+Thumbnail'} 
                  className="img-fluid w-100 h-100" 
                  alt="Thumbnail" 
                  style={{ objectFit: 'cover', minHeight: '200px' }}
                />
              </div>
              <div className="col-md-7">
                <div className="card-body p-4">
                  <span className="badge bg-primary bg-opacity-10 text-primary mb-2">
                    {lastActiveCourse.category || 'Kategori Umum'}
                  </span>
                  <h4 className="card-title fw-bold mb-3">{lastActiveCourse.title}</h4>
                  
                  {/* Progress Bar Real */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-1">
                        <small className="fw-bold text-muted">Progress Belajar</small>
                        <small className="fw-bold text-primary">{lastActiveCourse.progress || 0}%</small>
                    </div>
                    <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
                      <div 
                        className="progress-bar bg-primary" 
                        style={{ width: `${lastActiveCourse.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate(`/course/${lastActiveCourse.id}`)}
                    className="btn btn-primary fw-bold px-4 rounded-pill py-2"
                  >
                    Lanjutkan Belajar <i className="bi bi-arrow-right ms-2"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
           // Tampilan jika user belum punya kursus sama sekali
           <div className="text-center py-5 card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
             <div className="mb-3 text-muted opacity-50">
                <i className="bi bi-inbox fs-1"></i>
             </div>
             <h5 className="fw-bold text-muted">Belum ada aktivitas belajar.</h5>
             <p className="text-muted small">Mulai perjalanan belajarmu dengan mendaftar di kursus baru.</p>
             <div>
                <button onClick={() => navigate('/')} className="btn btn-outline-primary rounded-pill px-4">
                    Cari Kursus
                </button>
             </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default StudentDashboard;