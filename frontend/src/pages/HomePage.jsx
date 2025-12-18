import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null); // State untuk efek hover
  const navigate = useNavigate();

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

  // Tema Warna Focotech
  const colors = {
    primary: '#FF7E3E',
    background: '#FDF8F4',
    white: '#FFFFFF',
    textDark: '#2D2D2D',
    textLight: '#7A7A7A',
    border: '#EAEAEA',
    cardShadow: '0 10px 30px rgba(0,0,0,0.04)'
  };

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <p style={{ color: colors.primary, fontWeight: '600' }}>Sedang memuat data kursus...</p>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <p style={{ color: '#E03131' }}>{error}</p>
    </div>
  );

  return (
    <div style={{ 
      backgroundColor: colors.background, 
      minHeight: '100vh', 
      padding: '40px 20px',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: '800', 
            color: colors.textDark, 
            marginBottom: '10px' 
          }}>
            Jelajahi Kursus Terbaru
          </h2>
          <p style={{ color: colors.textLight }}>Tingkatkan keahlianmu dengan materi terbaik kami</p>
        </div>
        
        {courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', backgroundColor: colors.white, borderRadius: '24px' }}>
            <p style={{ color: colors.textLight }}>Belum ada kursus yang tersedia saat ini.</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gap: '30px', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' 
          }}>
            {courses.map((course) => (
              <div 
                key={course.id} 
                onMouseEnter={() => setHoveredCard(course.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ 
                  backgroundColor: colors.white,
                  borderRadius: '24px', 
                  overflow: 'hidden', 
                  border: `1px solid ${colors.border}`,
                  boxShadow: hoveredCard === course.id ? '0 15px 35px rgba(255, 126, 62, 0.15)' : colors.cardShadow,
                  transition: 'all 0.3s ease',
                  transform: hoveredCard === course.id ? 'translateY(-5px)' : 'translateY(0)',
                  cursor: 'pointer',
                  padding: '16px' // Padding dalam card agar mirip widget
                }}
                onClick={() => navigate(`/course/${course.id}`)}
              >
                
                {/* Image Container with Rounded Corners */}
                <div style={{ 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  height: '200px', 
                  marginBottom: '20px',
                  position: 'relative'
                }}>
                  <img 
                    src={course.thumbnail_url || 'https://via.placeholder.com/300x200?text=No+Image'} 
                    alt={course.title} 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover'
                    }}
                  />
                  {/* Category Tag Overlay */}
                  <span style={{ 
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: colors.primary,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    backdropFilter: 'blur(4px)'
                  }}>
                    {course.category || 'Umum'}
                  </span>
                </div>
                
                {/* Content */}
                <div style={{ padding: '0 5px' }}>
                  <h3 style={{ 
                    margin: '0 0 10px 0', 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    color: colors.textDark,
                    lineHeight: '1.4'
                  }}>
                    {course.title}
                  </h3>
                  
                  <p style={{ 
                    color: colors.textLight, 
                    fontSize: '14px', 
                    marginBottom: '20px', 
                    lineHeight: '1.6',
                    display: '-webkit-box',
                    WebkitLineClamp: '2', // Membatasi text hanya 2 baris
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {course.description}
                  </p>
                  
                  {/* Footer Card: Button & Price/Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <button 
                      style={{ 
                        backgroundColor: colors.primary, 
                        color: 'white', 
                        border: 'none', 
                        padding: '10px 20px', 
                        borderRadius: '12px', 
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(255, 126, 62, 0.3)',
                        transition: 'background 0.2s'
                      }}
                    >
                      Lihat Detail
                    </button>
                    
                    {/* Hiasan panah atau icon kecil */}
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      backgroundColor: '#FFF0E6', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
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

export default HomePage;