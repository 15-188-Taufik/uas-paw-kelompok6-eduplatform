import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const MyCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  // 1. Ambil data user yang sedang login
  const user = JSON.parse(localStorage.getItem('user'));

  // Tema Warna Focotech
  const colors = {
    primary: '#FF7E3E',
    background: '#FDF8F4',
    white: '#FFFFFF',
    textDark: '#2D2D2D',
    textLight: '#7A7A7A',
    border: '#EAEAEA',
    cardShadow: '0 10px 30px rgba(0,0,0,0.04)',
    dangerBg: '#FEF2F2', // Warna background merah lembut untuk tombol hapus
    dangerText: '#EF4444' // Warna teks merah
  };

  useEffect(() => {
    // Jika tidak ada user login, tendang ke halaman login
    if (!user) {
        navigate('/login');
        return;
    }

    const fetchMyCourses = async () => {
      try {
        const response = await api.get(`/students/${user.id}/courses`);
        setCourses(response.data.courses);
      } catch (err) {
        console.error("Gagal mengambil kursus:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyCourses();
  }, [navigate]); 

  // --- FUNGSI UNENROLL ---
  const handleUnenroll = async (courseId, courseTitle, e) => {
    e.stopPropagation(); // Mencegah klik tembus ke card (navigate)
    
    if (!window.confirm(`Apakah Anda yakin ingin keluar dari kursus "${courseTitle}"? Progress belajar Anda akan hilang permanen.`)) {
        return;
    }

    try {
        await api.post('/unenroll', {
            student_id: user.id,
            course_id: courseId
        });
        
        alert("Berhasil keluar dari kursus.");
        
        // Update UI: Hapus kursus dari state tanpa reload page
        setCourses(prevCourses => prevCourses.filter(c => c.id !== courseId));
        
    } catch (err) {
        console.error(err);
        alert("Gagal melakukan unenroll. Pastikan Backend sudah memiliki route /api/unenroll");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <p style={{ color: colors.primary, fontWeight: '600', fontFamily: 'Poppins' }}>Sedang memuat kursus Anda...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: colors.background, 
      minHeight: '100vh', 
      padding: '40px 20px',
      fontFamily: "'Poppins', sans-serif"
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: '800', 
            color: colors.textDark, 
            marginBottom: '10px' 
          }}>
            Kursus Saya
          </h2>
          <p style={{ color: colors.textLight, marginBottom: 0 }}>
            Lanjutkan pembelajaran Anda, <strong>{user?.name}</strong>
          </p>
        </div>

        {courses.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 40px', 
            backgroundColor: colors.white, 
            borderRadius: '24px',
            border: `1px solid ${colors.border}`
          }}>
            <div style={{ marginBottom: '20px' }}>
              <i className="bi bi-journal-x" style={{ fontSize: '48px', color: colors.textLight }}></i>
            </div>
            <h4 style={{ color: colors.textDark, fontWeight: '700', marginBottom: '10px' }}>
              Anda belum terdaftar di kursus apapun
            </h4>
            <p style={{ color: colors.textLight, marginBottom: '30px' }}>
              Mulai belajar dengan mengeksplorasi kursus-kursus menarik kami
            </p>
            <button 
              onClick={() => navigate('/')}
              style={{
                backgroundColor: colors.primary,
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '50px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255, 126, 62, 0.3)',
                transition: 'all 0.2s ease',
                fontFamily: 'Poppins'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(255, 126, 62, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(255, 126, 62, 0.3)';
              }}
            >
              Cari Kursus Baru
            </button>
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
                onClick={() => navigate(`/course/${course.id}`)} // Klik card untuk navigate
                style={{ 
                  backgroundColor: colors.white,
                  borderRadius: '24px', 
                  overflow: 'hidden', 
                  border: `1px solid ${colors.border}`,
                  boxShadow: hoveredCard === course.id ? '0 15px 35px rgba(255, 126, 62, 0.15)' : colors.cardShadow,
                  transition: 'all 0.3s ease',
                  transform: hoveredCard === course.id ? 'translateY(-5px)' : 'translateY(0)',
                  cursor: 'pointer',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  fontFamily: 'Poppins'
                }}
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
                    backdropFilter: 'blur(4px)',
                    fontFamily: 'Poppins'
                  }}>
                    {course.category || 'Umum'}
                  </span>
                </div>
                
                {/* Content */}
                <div style={{ padding: '0 5px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ 
                    margin: '0 0 10px 0', 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    color: colors.textDark,
                    lineHeight: '1.4',
                    fontFamily: 'Poppins'
                  }}>
                    {course.title}
                  </h3>
                  
                  <p style={{ 
                    color: colors.textLight, 
                    fontSize: '14px', 
                    marginBottom: '12px',
                    fontFamily: 'Poppins'
                  }}>
                    <i className="bi bi-person-circle me-1"></i> {course.instructor_name || 'Instruktur'}
                  </p>

                  {/* Progress Bar Section */}
                  <div style={{ marginBottom: '20px', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <small style={{ color: colors.textLight, fontWeight: '600', fontFamily: 'Poppins' }}>Progress</small>
                      <small style={{ color: colors.primary, fontWeight: '700', fontFamily: 'Poppins' }}>
                        {course.progress ? Math.round(course.progress) : 0}%
                      </small>
                    </div>
                    <div style={{ width: '100%', height: '8px', borderRadius: '10px', backgroundColor: '#e9ecef', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${course.progress || 0}%`, 
                          height: '100%', 
                          backgroundColor: colors.primary,
                          borderRadius: '10px',
                          transition: 'width 0.3s ease'
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Footer Card: Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/course/${course.id}`);
                          }}
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
                            transition: 'all 0.2s ease',
                            fontFamily: 'Poppins'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          Lanjutkan
                        </button>

                        {/* TOMBOL UNENROLL (BARU) */}
                        <button 
                          onClick={(e) => handleUnenroll(course.id, course.title, e)}
                          title="Batal Daftar / Keluar Kursus"
                          style={{ 
                            backgroundColor: colors.dangerBg, 
                            color: colors.dangerText, 
                            border: 'none', 
                            width: '42px', 
                            height: '42px',
                            borderRadius: '12px', 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontSize: '16px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.backgroundColor = '#FEE2E2';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.backgroundColor = colors.dangerBg;
                          }}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                    </div>
                    
                    {/* Arrow Icon Circle */}
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      backgroundColor: '#FFF0E6', 
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
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;