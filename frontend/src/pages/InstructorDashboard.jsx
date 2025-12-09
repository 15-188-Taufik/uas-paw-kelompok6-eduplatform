import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.role !== 'instructor') {
      alert("Halaman ini hanya untuk Instruktur.");
      navigate('/');
      return;
    }

    const fetchMyTeachingCourses = async () => {
      try {
        const response = await api.get(`/instructors/${user.id}/courses`);
        setCourses(response.data.courses); 
      } catch (err) {
        console.error("Gagal load kursus instruktur:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyTeachingCourses();
  }, [user, navigate]);

  if (loading) return <p style={{textAlign: 'center', marginTop: '50px'}}>Loading Dashboard...</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#bc2131', margin: 0 }}>Dashboard Instruktur</h2>
        <button 
          onClick={() => navigate('/create-course')}
          style={{ 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}
        >
          + Buat Kursus Baru
        </button>
      </div>
      
      {courses.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#666', border: '1px dashed #ccc', padding: '40px', borderRadius: '8px' }}>
          <h3>Belum ada kursus yang Anda ajar.</h3>
          <p>Silakan buat kursus pertama Anda untuk mulai mengajar.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {courses.map((course) => (
            <div key={course.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'white', position: 'relative' }}>
              <div style={{ backgroundColor: '#bc2131', color: 'white', padding: '5px 10px', fontSize: '0.8rem', position: 'absolute', top: 10, right: 10, borderRadius: '4px' }}>
                ID: {course.id}
              </div>
              <img 
                src={course.thumbnail_url || 'https://via.placeholder.com/300x150'} 
                alt={course.title} 
                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
              />
              <div style={{ padding: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>{course.title}</h4>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>{course.category}</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button 
                    onClick={() => navigate(`/course/${course.id}`)}
                    style={{ flex: 1, padding: '8px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', borderRadius: '4px' }}
                  >
                    Lihat
                  </button>
                  <button 
                    onClick={() => navigate(`/manage-course/${course.id}`)} // <--- Ubah link ke sini
                    style={{ flex: 1, padding: '8px', border: 'none', background: '#007bff', color: 'white', cursor: 'pointer', borderRadius: '4px' }}
                  >
                    Kelola
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;