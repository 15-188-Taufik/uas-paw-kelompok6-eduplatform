import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const MyCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Ambil data user dari localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // Kalau belum login, tendang ke halaman login
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchMyCourses = async () => {
      try {
        // Tembak API Backend: GET /api/students/{id}/courses
        const response = await api.get(`/students/${user.id}/courses`);
        setCourses(response.data.courses); 
      } catch (err) {
        console.error("Gagal ambil data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, [user, navigate]);

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Memuat kursus Anda...</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', color: '#bc2131' }}>Dashboard Belajar Saya</h2>
      
      {courses.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
          <p>Anda belum mendaftar di kursus apapun.</p>
          <button 
            onClick={() => navigate('/')}
            style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#bc2131', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cari Kursus
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {courses.map((course) => (
            <div key={course.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white' }}>
              
              <img 
                src={course.thumbnail_url || 'https://via.placeholder.com/300x150'} 
                alt={course.title} 
                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
              />
              
              <div style={{ padding: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>{course.title}</h4>
                <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: '15px' }}>
                  {course.category}
                </div>
                
                <button 
                  onClick={() => navigate(`/course/${course.id}`)}
                  style={{ 
                    width: '100%',
                    padding: '10px', 
                    backgroundColor: '#007bff', // Warna biru untuk "Lanjut"
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Lanjut Belajar
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;