import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('semua');
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

  // Theme Configuration
  const colors = {
    primary: '#FF7E3E',
    primaryLight: '#FFF5F1',
    background: '#FDF8F4',
    white: '#FFFFFF',
    textDark: '#2D2D2D',
    textLight: '#7A7A7A',
    textMuted: '#9CA3AF',
    border: '#EAEAEA',
    cardShadow: '0 10px 30px rgba(0,0,0,0.04)',
    cardShadowHeavy: '0 20px 40px rgba(0,0,0,0.1)'
  };

  // Get unique categories
  const categories = ['semua', ...new Set(courses.map(c => c.category || 'Umum'))];

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchCategory = selectedCategory === 'semua' || course.category === selectedCategory;
    return matchCategory;
  });

  // Featured course (first one)
  const featuredCourse = courses[0];

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: colors.primary, fontWeight: '600', fontSize: '16px' }}>Sedang memuat kursus...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
        <p style={{ color: '#E03131', fontWeight: '600' }}>{error}</p>
      </div>
    </div>
  );

  return (
    <div style={{ 
      backgroundColor: colors.background, 
      minHeight: '100vh',
      fontFamily: "'Poppins', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Gradient Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '400px',
        background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.background})`,
        zIndex: -1,
        pointerEvents: 'none'
      }}></div>

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* HEADER - Enhanced */}
        <div style={{ marginBottom: '50px', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '800', 
            color: colors.textDark, 
            marginBottom: '12px',
            background: `linear-gradient(135deg, ${colors.primary}, #FF6B6B)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Jelajahi Dunia Pembelajaran
          </h1>
          <p style={{ 
            color: colors.textLight, 
            fontSize: '14px',
            marginBottom: '30px',
            maxWidth: '500px',
            margin: 'auto',
            lineHeight: 1.6
          }}>
            Tingkatkan keahlianmu dengan ribuan kursus berkualitas dari instruktur berpengalaman
          </p>

          {/* Category Filter */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '20px'
          }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '50px',
                  border: selectedCategory === cat ? 'none' : `2px solid ${colors.border}`,
                  backgroundColor: selectedCategory === cat ? colors.primary : 'white',
                  color: selectedCategory === cat ? 'white' : colors.textDark,
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedCategory === cat ? `0 4px 12px ${colors.primary}40` : 'none'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== cat) {
                    e.target.style.borderColor = colors.primary;
                    e.target.style.color = colors.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== cat) {
                    e.target.style.borderColor = colors.border;
                    e.target.style.color = colors.textDark;
                  }
                }}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Course - Only if filteredCourses includes featured */}
        {filteredCourses.length > 0 && featuredCourse && filteredCourses[0] === featuredCourse && (
          <div style={{
            marginBottom: '50px',
            background: `linear-gradient(135deg, ${colors.primary}, #FF6B6B)`,
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: `0 20px 40px ${colors.primary}30`,
            transition: 'all 0.3s ease'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              {/* Image */}
              <div style={{
                height: '300px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <img
                  src={featuredCourse.thumbnail_url || 'https://via.placeholder.com/600x300'}
                  alt={featuredCourse.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(to right, rgba(0,0,0,0.3), transparent)'
                }}></div>
              </div>

              {/* Content */}
              <div style={{
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                color: 'white'
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  marginBottom: '12px',
                  opacity: 0.9,
                  letterSpacing: '1px'
                }}>
                  🌟 KURSUS UNGGULAN
                </div>
                <h2 style={{
                  fontSize: '32px',
                  fontWeight: '800',
                  marginBottom: '12px',
                  lineHeight: 1.2
                }}>
                  {featuredCourse.title}
                </h2>
                <p style={{
                  fontSize: '14px',
                  marginBottom: '24px',
                  opacity: 0.95,
                  lineHeight: 1.6
                }}>
                  {(featuredCourse.description || '').substring(0, 100)}...
                </p>
                <button
                  onClick={() => navigate(`/course/${featuredCourse.id}`)}
                  style={{
                    padding: '12px 28px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: 'white',
                    color: colors.primary,
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: 'fit-content',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                >
                  Mulai Belajar →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 40px',
            backgroundColor: colors.white,
            borderRadius: '24px',
            border: `2px dashed ${colors.border}`
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ color: colors.textDark, fontWeight: '700', marginBottom: '8px' }}>
              Tidak ada kursus ditemukan
            </h3>
            <p style={{ color: colors.textMuted, marginBottom: '24px' }}>
              Coba ubah kategori atau cari dengan kata kunci lain
            </p>
            <button
              onClick={() => {
                setSelectedCategory('semua');
              }}
              style={{
                padding: '10px 24px',
                backgroundColor: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = `0 4px 12px ${colors.primary}40`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <>
            <div style={{
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                color: colors.textDark,
                fontWeight: '700',
                fontSize: '18px',
                margin: 0
              }}>
                {filteredCourses.length} Kursus Tersedia
              </h3>
            </div>

            <div style={{ 
              display: 'grid', 
              gap: '24px', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))'
            }}>
              {filteredCourses.map((course) => (
                <div 
                  key={course.id} 
                  onMouseEnter={() => setHoveredCard(course.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ 
                    backgroundColor: colors.white,
                    borderRadius: '20px', 
                    overflow: 'hidden', 
                    border: `2px solid ${hoveredCard === course.id ? colors.primary : colors.border}`,
                    boxShadow: hoveredCard === course.id ? colors.cardShadowHeavy : colors.cardShadow,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: hoveredCard === course.id ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                    cursor: 'pointer',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  
                  {/* Image Container */}
                  <div style={{ 
                    borderRadius: '16px', 
                    overflow: 'hidden', 
                    height: '200px', 
                    marginBottom: '16px',
                    position: 'relative'
                  }}>
                    <img 
                      src={course.thumbnail_url || 'https://via.placeholder.com/300x200?text=No+Image'} 
                      alt={course.title} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        transform: hoveredCard === course.id ? 'scale(1.05)' : 'scale(1)'
                      }}
                    />
                    {/* Category Tag */}
                    <span style={{ 
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: colors.white,
                      color: colors.primary,
                      padding: '6px 14px',
                      borderRadius: '50px',
                      fontSize: '11px',
                      fontWeight: '700',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      {course.category || 'Umum'}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: '16px', 
                      fontWeight: '700', 
                      color: colors.textDark,
                      lineHeight: '1.3'
                    }}>
                      {course.title}
                    </h3>
                    
                    <p style={{ 
                      color: colors.textMuted, 
                      fontSize: '13px', 
                      marginBottom: '16px', 
                      lineHeight: '1.5',
                      display: '-webkit-box',
                      WebkitLineClamp: '2',
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flex: 1
                    }}>
                      {course.description || 'Kursus menarik untuk meningkatkan skill Anda'}
                    </p>
                    
                    {/* Footer */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingTop: '12px',
                      borderTop: `1px solid ${colors.border}`
                    }}>
                      <button 
                        style={{ 
                          backgroundColor: colors.primary, 
                          color: 'white', 
                          border: 'none', 
                          padding: '8px 16px', 
                          borderRadius: '10px', 
                          fontWeight: '600',
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = `0 4px 12px ${colors.primary}40`;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        Lihat Detail
                      </button>
                      
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        backgroundColor: colors.primaryLight, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        transform: hoveredCard === course.id ? 'rotate(45deg) scale(1.1)' : 'rotate(0) scale(1)'
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
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;