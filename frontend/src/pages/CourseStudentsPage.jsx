import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CourseStudentsPage = () => {
  const { courseId } = useParams(); // Pastikan di App.jsx routenya: /course-students/:courseId
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    const fetchCourseStudents = async () => {
      try {
        // [PERBAIKAN] Panggil endpoint spesifik yang baru kita buat
        const response = await api.get(`/api/courses/${courseId}/students`);
        
        // Backend return: { course: {...}, students: [...] }
        setCourse(response.data.course);
        setStudents(response.data.students || []);
        
      } catch (err) {
        console.error("Gagal mengambil data siswa kursus:", err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
        fetchCourseStudents();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{backgroundColor: theme.bg}}>
        <div className="spinner-border" role="status" style={{color: theme.primary}}></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-vh-100 py-5" style={{ backgroundColor: theme.bg, fontFamily: "'Poppins', sans-serif" }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          <div className="text-center py-5">
            <h3 style={{color: theme.textMain}}>Kursus tidak ditemukan</h3>
            <button onClick={() => navigate('/instructor-dashboard')} className="btn mt-3" style={{backgroundColor: theme.primary, color: 'white'}}>
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: theme.bg, fontFamily: "'Poppins', sans-serif" }}>
      <div className="container" style={{ maxWidth: '1100px' }}>

        {/* HEADER SECTION */}
        <div className="d-flex justify-content-between align-items-center mb-5 pb-4" style={{borderBottom: `2px solid ${theme.primaryLight}`}}>
          <div>
            <h2 className="fw-bold mb-1" style={{color: theme.textMain}}>Siswa Terdaftar</h2>
            <p className="mb-0" style={{color: theme.textSec}}>Kursus: <strong>{course.title}</strong></p>
          </div>
          <button
            onClick={() => navigate('/instructor-courses')}
            className="btn fw-bold px-4 rounded-pill shadow-sm"
            style={{ backgroundColor: theme.primary, color: 'white', border: 'none', padding: '12px 24px' }}
          >
            <i className="bi bi-arrow-left me-2"></i> Kembali
          </button>
        </div>

        {/* STATISTIK */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card border-0 h-100" style={{ borderRadius: '20px', boxShadow: theme.shadowCard, backgroundColor: theme.white }}>
              <div className="card-body p-4 d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{width: '60px', height: '60px', backgroundColor: theme.primaryLight, color: theme.primary}}>
                  <i className="bi bi-people-fill fs-3"></i>
                </div>
                <div>
                  <h3 className="fw-bold mb-0" style={{color: theme.textMain}}>{students.length}</h3>
                  <small className="fw-semibold" style={{color: theme.textSec}}>Total Siswa</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DAFTAR SISWA */}
        <div className="d-flex align-items-center justify-content-between mb-4">
            <h5 className="fw-bold" style={{color: theme.textMain}}>Daftar Siswa</h5>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-5 card border-0" style={{ borderRadius: '20px', boxShadow: theme.shadowCard, backgroundColor: theme.white }}>
            <div className="mb-3 opacity-50" style={{color: theme.primary}}>
                <i className="bi bi-person-x fs-1"></i>
            </div>
            <h5 style={{color: theme.textMain}}>Belum ada siswa yang terdaftar.</h5>
            <p className="small mb-4" style={{color: theme.textSec}}>Siswa akan muncul di sini setelah mereka mendaftar kursus ini.</p>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {students.map((student) => (
              <div className="col" key={student.id}>
                <div className="card h-100 border-0" style={{ borderRadius: '20px', boxShadow: theme.shadowCard, backgroundColor: theme.white }}>
                  <div className="card-body p-4 d-flex align-items-center gap-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px', backgroundColor: theme.primaryLight, color: theme.primary, flexShrink: 0}}>
                      <span className="fw-bold fs-5">{student.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <h6 className="fw-bold mb-1 text-truncate" style={{color: theme.textMain}} title={student.name}>{student.name}</h6>
                      <p className="small mb-1 text-truncate" style={{color: theme.textSec}} title={student.email}>{student.email}</p>
                      <small className="text-muted" style={{fontSize: '0.75rem'}}>ID Siswa: {student.id}</small>
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

export default CourseStudentsPage;