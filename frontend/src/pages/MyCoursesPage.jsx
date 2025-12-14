import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const MyCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Ambil data user yang sedang login
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // Jika tidak ada user login, tendang ke halaman login
    if (!user) {
        navigate('/login');
        return;
    }

    const fetchMyCourses = async () => {
      try {
        // [FIX] Gunakan URL yang sesuai dengan routes.py: /students/{id}/courses
        const response = await api.get(`/students/${user.id}/courses`);
        setCourses(response.data.courses);
      } catch (err) {
        console.error("Gagal mengambil kursus:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyCourses();
  }, [navigate]); // Hapus 'user' dari dependency agar tidak loop, karena user didapat dari localStorage langsung

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: '#f3f4f6' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: '#f3f4f6' }}>
      <div className="container">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="fw-bold text-dark mb-1">Kursus Saya</h2>
            <p className="text-muted mb-0">Lanjutkan pembelajaran Anda, <strong>{user?.name}</strong>.</p>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-3">
              <i className="bi bi-journal-x text-muted" style={{ fontSize: '3rem' }}></i>
            </div>
            <h4 className="text-muted">Anda belum terdaftar di kursus apapun.</h4>
            <p className="text-muted small">Mungkin Anda belum melakukan Enroll atau data belum tersinkronisasi.</p>
            <button className="btn btn-primary mt-3 px-4 rounded-pill" onClick={() => navigate('/')}>
              Cari Kursus Baru
            </button>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {courses.map((course) => (
              <div className="col" key={course.id}>
                <div className="card-modern h-100 d-flex flex-column">
                  {/* Thumbnail Kursus */}
                  <div className="position-relative">
                    <img 
                      src={course.thumbnail_url || 'https://via.placeholder.com/400x200?text=No+Image'} 
                      className="card-img-top" 
                      alt={course.title} 
                      style={{ height: '180px', objectFit: 'cover', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}
                    />
                    <div className="position-absolute top-0 end-0 m-3">
                      <span className="badge bg-white text-primary shadow-sm px-3 py-2 rounded-pill fw-bold">
                        {course.category || 'Umum'}
                      </span>
                    </div>
                  </div>

                  <div className="card-body d-flex flex-column p-4">
                    <h5 className="card-title fw-bold text-dark mb-2 text-truncate" title={course.title}>
                      {course.title}
                    </h5>
                    <p className="text-muted small mb-3">
                      <i className="bi bi-person-circle me-1"></i> {course.instructor_name || 'Instruktur'}
                    </p>

                    {/* Progress Bar Section */}
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted fw-semibold">Progress</small>
                        <small className="text-primary fw-bold">
                          {course.progress ? Math.round(course.progress) : 0}%
                        </small>
                      </div>
                      <div className="progress mb-3" style={{ height: '8px', borderRadius: '10px', backgroundColor: '#e9ecef' }}>
                        <div 
                          className="progress-bar bg-primary" 
                          role="progressbar" 
                          style={{ width: `${course.progress || 0}%`, borderRadius: '10px' }}
                        ></div>
                      </div>

                      <button 
                        onClick={() => navigate(`/course/${course.id}`)}
                        className="btn btn-primary w-100 fw-bold py-2 rounded-3"
                      >
                        Lanjutkan Belajar
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

export default MyCoursesPage;