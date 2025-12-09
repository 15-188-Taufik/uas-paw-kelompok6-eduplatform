import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import navigasi
import api from '../api/axios';

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook navigasi

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        setCourses(response.data.courses); 
      } catch (err) {
        console.error("Error:", err);
        setError("Gagal mengambil data. Pastikan Backend jalan.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <p style={{ textAlign: 'center' }}>Sedang memuat data kursus...</p>;
  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Daftar Kursus Terbaru</h2>
      
      {courses.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Belum ada kursus yang tersedia.</p>
      ) : (
        <div style={{ display: 'grid', gap: '30px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {courses.map((course) => (
            <div key={course.id} style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              
              <img 
                src={course.thumbnail_url || 'https://via.placeholder.com/300x200'} 
                alt={course.title} 
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
              
              <div style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem' }}>{course.title}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>{course.description}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', backgroundColor: '#f0f0f0', padding: '5px 10px', borderRadius: '20px' }}>
                    {course.category}
                  </span>
                  
                  <button 
                    onClick={() => navigate(`/course/${course.id}`)}
                    style={{ 
                      backgroundColor: '#bc2131', 
                      color: 'white', 
                      border: 'none', 
                      padding: '8px 15px', 
                      cursor: 'pointer', 
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}
                  >
                    Lihat Detail
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

export default HomePage;