import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // 1. Cek Role: Hanya Instruktur yang boleh akses
    if (!user || user.role !== 'instructor') {
      navigate('/');
      return;
    }

    const fetchMyTeachingCourses = async () => {
      try {
        // [API] Mengambil daftar kursus yang dibuat oleh instruktur ini
        // Pastikan endpoint ini sesuai dengan routes.py di backend Anda
        const response = await api.get(`/instructors/${user.id}/courses`);
        setCourses(response.data.courses); 
      } catch (err) {
        console.error("Gagal mengambil data instruktur:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTeachingCourses();
  }, [user, navigate]);

  // Hitung Statistik Sederhana
  const totalCourses = courses.length;
  // Contoh statistik lain: Total kategori unik yang diajarkan
  const uniqueCategories = [...new Set(courses.map(c => c.category))].length;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 py-4" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        
        {/* HEADER SECTION */}
        <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">Dashboard Instruktur</h2>
            <p className="text-muted mb-0">Kelola konten pembelajaran dan pantau perkembangan kursus Anda.</p>
          </div>
          <button 
            onClick={() => navigate('/create-course')}
            className="btn btn-primary fw-bold px-4 rounded-pill shadow-sm d-flex align-items-center gap-2"
          >
            <i className="bi bi-plus-lg"></i> Buat Kursus Baru
          </button>
        </div>
        
        {/* STATISTIK RINGKAS */}
        <div className="row g-4 mb-5">
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '16px' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                  <i className="bi bi-collection-play-fill fs-3"></i>
                </div>
                <div>
                  <h3 className="fw-bold mb-0">{totalCourses}</h3>
                  <small className="text-muted fw-semibold">Kursus Aktif</small>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '16px' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-info bg-opacity-10 p-3 rounded-circle text-info">
                  <i className="bi bi-tags-fill fs-3"></i>
                </div>
                <div>
                  <h3 className="fw-bold mb-0">{uniqueCategories}</h3>
                  <small className="text-muted fw-semibold">Kategori Materi</small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
             {/* Placeholder untuk fitur masa depan (misal: Total Siswa) */}
            <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '16px' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success">
                  <i className="bi bi-people-fill fs-3"></i>
                </div>
                <div>
                  <h3 className="fw-bold mb-0">-</h3>
                  <small className="text-muted fw-semibold">Total Siswa</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DAFTAR KURSUS */}
        <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="fw-bold text-dark">Daftar Kursus Anda</h5>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-5 card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <div className="mb-3 text-muted opacity-50">
                <i className="bi bi-folder2-open fs-1"></i>
            </div>
            <h5 className="text-muted">Belum ada kursus yang dibuat.</h5>
            <p className="small text-muted mb-4">Mulai bagikan ilmu Anda sekarang.</p>
            <div>
                <button 
                    onClick={() => navigate('/create-course')}
                    className="btn btn-outline-primary rounded-pill px-4"
                >
                    Buat Kursus Pertama
                </button>
            </div>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {courses.map((course) => (
              <div className="col" key={course.id}>
                <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden', transition: 'transform 0.2s' }}>
                  {/* Thumbnail & Badge ID */}
                  <div className="position-relative">
                      <img 
                          src={course.thumbnail_url || 'https://via.placeholder.com/400x200?text=No+Thumbnail'} 
                          className="card-img-top" 
                          alt={course.title} 
                          style={{ height: '180px', objectFit: 'cover' }}
                      />
                      <div className="position-absolute top-0 start-0 m-3">
                        <span className="badge bg-white text-dark shadow-sm px-2 py-1 rounded fw-bold border">
                            ID: {course.id}
                        </span>
                      </div>
                  </div>

                  <div className="card-body d-flex flex-column p-4">
                    <div className="mb-2">
                        <span className="badge bg-primary bg-opacity-10 text-primary px-2 py-1 rounded">
                            {course.category || 'Umum'}
                        </span>
                    </div>
                    <h5 className="card-title fw-bold text-dark mb-2 text-truncate" title={course.title}>
                        {course.title}
                    </h5>
                    <p className="card-text text-muted small mb-4 line-clamp-2" style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {course.description || 'Tidak ada deskripsi.'}
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="mt-auto d-flex flex-column gap-2">
                      <button 
                          onClick={() => navigate(`/manage-course/${course.id}`)}
                          className="btn btn-primary w-100 fw-bold rounded-pill"
                      >
                          <i className="bi bi-pencil-square me-2"></i>Kelola Materi
                      </button>
                      <button 
                          onClick={() => navigate(`/course/${course.id}`)}
                          className="btn btn-outline-secondary w-100 fw-semibold rounded-pill"
                      >
                          <i className="bi bi-eye me-2"></i>Lihat Preview
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;