import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // --- THEME CONFIGURATION ---
  const theme = {
    primary: '#FF7E3E',
    primaryLight: '#FFF5F1',
    bg: '#FDF8F4',
    white: '#FFFFFF',
    textMain: '#2D2D2D',
    textSec: '#757575',
    shadowCard: '0 10px 25px rgba(255, 126, 62, 0.08)',
  };

  useEffect(() => {
    // 1. Cek Role
    if (!user || user.role !== 'instructor') {
      navigate('/');
      return;
    }

    // 2. Fetch Data Kursus
    const fetchMyTeachingCourses = async () => {
      try {
        const response = await api.get(`/api/instructors/${user.id}/courses`);
        setCourses(response.data.courses); 
      } catch (err) {
        console.error("Gagal mengambil data instruktur:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTeachingCourses();
  }, [user, navigate]);

  // --- LOGIKA HITUNG STATISTIK ---
  
  // 1. Total Kursus
  const totalCourses = courses.length;

  // 2. Total Kategori Unik
  const uniqueCategories = [...new Set(courses.map(c => c.category))].length;

  // 3. [FIX] Total Siswa (Menjumlahkan seluruh siswa dari semua kursus)
  const totalStudents = courses.reduce((acc, curr) => {
    // Backend biasanya mengirim 'students_count', 'enrollments_count', atau array 'enrollments'
    const count = curr.students_count || curr.enrollments_count || (curr.enrollments ? curr.enrollments.length : 0) || 0;
    return acc + count;
  }, 0);


  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{backgroundColor: theme.bg}}>
        <div className="spinner-border" role="status" style={{color: theme.primary}}></div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: theme.bg, fontFamily: "'Poppins', sans-serif" }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        
        {/* HEADER SECTION */}
        <div className="d-flex justify-content-between align-items-center mb-5 pb-4" style={{borderBottom: `2px solid ${theme.primaryLight}`}}>
          <div>
            <h2 className="fw-bold mb-1" style={{color: theme.textMain}}>Dashboard Instruktur</h2>
            <p className="mb-0" style={{color: theme.textSec}}>Kelola konten pembelajaran dan pantau perkembangan kursus Anda.</p>
          </div>
          <button 
            onClick={() => navigate('/instructor-courses')} // Diarahkan ke halaman list course agar UX konsisten
            className="btn fw-bold px-4 rounded-pill shadow-sm d-flex align-items-center gap-2"
            style={{ backgroundColor: theme.primary, color: 'white', border: 'none', padding: '12px 24px' }}
          >
            <i className="bi bi-gear-fill"></i> Kelola Kursus
          </button>
        </div>
        
        {/* STATISTIK RINGKAS */}
        <div className="row g-4 mb-5">
          {/* Card 1: Total Kursus */}
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 h-100" style={{ borderRadius: '20px', boxShadow: theme.shadowCard, backgroundColor: theme.white }}>
              <div className="card-body p-4 d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{width: '60px', height: '60px', backgroundColor: theme.primaryLight, color: theme.primary}}>
                  <i className="bi bi-collection-play-fill fs-3"></i>
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{color: theme.textMain}}>{totalCourses}</h3>
                  <small className="fw-semibold" style={{color: theme.textSec}}>Kursus Aktif</small>
                </div>
              </div>
            </div>
          </div>
          
          {/* Card 2: Kategori */}
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 h-100" style={{ borderRadius: '20px', boxShadow: theme.shadowCard, backgroundColor: theme.white }}>
              <div className="card-body p-4 d-flex align-items-center gap-3">
                 <div className="rounded-circle d-flex align-items-center justify-content-center" style={{width: '60px', height: '60px', backgroundColor: '#E0F2FE', color: '#0EA5E9'}}>
                  <i className="bi bi-tags-fill fs-3"></i>
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{color: theme.textMain}}>{uniqueCategories}</h3>
                  <small className="fw-semibold" style={{color: theme.textSec}}>Kategori Materi</small>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Total Siswa (SUDAH DIPERBAIKI) */}
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 h-100" style={{ borderRadius: '20px', boxShadow: theme.shadowCard, backgroundColor: theme.white }}>
              <div className="card-body p-4 d-flex align-items-center gap-3">
                 <div className="rounded-circle d-flex align-items-center justify-content-center" style={{width: '60px', height: '60px', backgroundColor: '#DCFCE7', color: '#22C55E'}}>
                  <i className="bi bi-people-fill fs-3"></i>
                </div>
                <div>
                  {/* Variabel totalStudents dipanggil di sini */}
                  <h3 className="fw-bold mb-0" style={{color: theme.textMain}}>{totalStudents}</h3>
                  <small className="fw-semibold" style={{color: theme.textSec}}>Total Siswa</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DAFTAR KURSUS */}
        <div className="d-flex align-items-center justify-content-between mb-4">
            <h5 className="fw-bold" style={{color: theme.textMain}}>Preview Kursus Anda</h5>
            <button onClick={() => navigate('/instructor-courses')} className="btn btn-link text-decoration-none fw-bold" style={{color: theme.primary}}>Lihat Semua</button>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-5 card border-0" style={{ borderRadius: '20px', boxShadow: theme.shadowCard, backgroundColor: theme.white }}>
            <div className="mb-3 opacity-50" style={{color: theme.primary}}>
                <i className="bi bi-folder2-open fs-1"></i>
            </div>
            <h5 style={{color: theme.textMain}}>Belum ada kursus yang dibuat.</h5>
            <p className="small mb-4" style={{color: theme.textSec}}>Mulai bagikan ilmu Anda sekarang.</p>
            <div>
                <button 
                    onClick={() => navigate('/instructor-courses')} // Diarahkan ke create via page courses
                    className="btn btn-outline-primary rounded-pill px-4"
                    style={{ borderColor: theme.primary, color: theme.primary }}
                >
                    Buat Kursus Pertama
                </button>
            </div>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {courses.slice(0, 3).map((course) => ( // Hanya menampilkan 3 kursus terbaru di dashboard
              <div className="col" key={course.id}>
                <div className="card h-100 border-0" style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: theme.shadowCard, backgroundColor: theme.white, transition: 'transform 0.2s' }}>
                  {/* Thumbnail */}
                  <div className="position-relative">
                      <img 
                          src={course.thumbnail_url || 'https://via.placeholder.com/400x200?text=No+Thumbnail'} 
                          className="card-img-top" 
                          alt={course.title} 
                          style={{ height: '180px', objectFit: 'cover' }}
                      />
                      <div className="position-absolute top-0 start-0 m-3">
                        <span className="badge bg-white shadow-sm px-2 py-1 rounded fw-bold border" style={{color: theme.textMain}}>
                            ID: {course.id}
                        </span>
                      </div>
                  </div>

                  <div className="card-body d-flex flex-column p-4">
                    <div className="mb-2">
                        <span className="badge px-2 py-1 rounded" style={{backgroundColor: theme.primaryLight, color: theme.primary}}>
                            {course.category || 'Umum'}
                        </span>
                    </div>
                    <h5 className="card-title fw-bold mb-2 text-truncate" title={course.title} style={{color: theme.textMain}}>
                        {course.title}
                    </h5>
                    <div className="d-flex align-items-center gap-2 mb-3 text-muted small">
                        <i className="bi bi-person-fill"></i>
                        <span>{course.students_count || course.enrollments_count || 0} Siswa</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-auto d-flex flex-column gap-2">
                      <button 
                          onClick={() => navigate(`/manage-course/${course.id}`)}
                          className="btn w-100 fw-bold rounded-pill"
                          style={{backgroundColor: theme.primary, color: 'white', border: 'none'}}
                      >
                          <i className="bi bi-pencil-square me-2"></i>Kelola Kelas
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