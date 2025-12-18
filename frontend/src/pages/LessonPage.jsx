import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const LessonPage = () => {
  const { id, moduleId, courseId } = useParams();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user'));

  // --- THEME ---
  const theme = {
    primary: '#FF7E3E',
    primaryLight: '#FFF5F1',
    primaryHover: '#E56020',
    primaryDark: '#D55A1E',
    bg: '#FDF8F4',
    white: '#FFFFFF',
    textMain: '#2D2D2D',
    textSec: '#757575',
    textMuted: '#9CA3AF',
    border: '#F0F0F0',
    danger: '#FF4D4F',
    success: '#52C41A',
    warning: '#F59E0B',
    info: '#0EA5E9',
    shadowSoft: '0 8px 30px rgba(0,0,0,0.04)',
    shadowHeavy: '0 15px 35px rgba(255, 126, 62, 0.15)',
    shadowMedium: '0 10px 25px rgba(255, 126, 62, 0.08)',
    shadowXS: '0 2px 8px rgba(0,0,0,0.05)'
  };

  // --- ANIMATIONS ---
  const styles = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }
    .lesson-page-animate {
      animation: fadeInUp 0.6s ease-out;
    }
    .sidebar-animate {
      animation: slideInRight 0.6s ease-out;
    }
  `;

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/lessons/${id}`);
        setLesson(res.data.lesson);
        
        // Fetch course info if available
        if (courseId) {
          const courseRes = await api.get(`/courses/${courseId}`);
          setCourse(courseRes.data.course);
          
          // Fetch modules for sidebar
          const modulesRes = await api.get(`/courses/${courseId}/modules`);
          setModules(modulesRes.data.modules || []);
        }
      } catch (err) {
        console.error("Gagal load lesson:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessonData();
  }, [id, courseId]);

  const handleComplete = async () => {
    if (!user) return;
    try {
      await api.post(`/lessons/${id}/complete`, {
        student_id: user.id
      });
      setIsCompleted(true);
      alert("Selamat! Materi selesai. Progress Anda telah diperbarui.");
    } catch (err) {
      console.error(err);
    }
  };

  // --- HELPER: Proxy Download (Backend Python) ---
  // Kita tetap pakai ini untuk tombol "Download" agar stabil
  const getProxyDownloadUrl = (fileUrl) => {
    if (!fileUrl) return '#';
    return `${api.defaults.baseURL}/proxy_download?url=${encodeURIComponent(fileUrl)}`;
  };

  // --- HELPER: Google Viewer URL ---
  // Kita pakai URL ASLI Cloudinary untuk Google Viewer (karena Google butuh akses publik)
  const getGoogleViewerUrl = (fileUrl) => {
     return `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
  };

  // --- RENDER CONTENT ---
  const renderContent = (url) => {
    if (!url) return null;

    // 1. Youtube Embed
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let embedUrl = url.replace('watch?v=', 'embed/');
      if (url.includes('youtu.be/')) embedUrl = url.replace('youtu.be/', 'youtube.com/embed/');
      
      return (
        <div className="ratio ratio-16x9 bg-dark rounded overflow-hidden shadow mb-4">
          <iframe 
             src={embedUrl} 
             title="Video Youtube" 
             allowFullScreen 
             className="w-100 h-100"
          />
        </div>
      );
    }

    // Ambil ekstensi
    let extension = 'FILE';
    if (url.includes('.')) {
        extension = url.split('.').pop().toLowerCase();
    }

    // 2. Video Player (.mp4, .webm)
    if (['mp4', 'webm', 'ogg', 'mov'].includes(extension)) {
        return (
            <div className="ratio ratio-16x9 bg-dark rounded overflow-hidden shadow mb-4">
                <video controls className="w-100 h-100">
                    <source src={url} />
                    Browser Anda tidak mendukung tag video.
                </video>
            </div>
        );
    }

    // 3. Gambar (.jpg, .png)
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension)) {
        return (
            <div className="text-center mb-4">
                <img src={url} alt="Materi" className="img-fluid rounded shadow" style={{maxHeight: '600px'}} />
            </div>
        );
    }

    // 4. DOCUMENT VIEWER (PDF, WORD, PPT, EXCEL)
    // Sekarang kita TAMPILKAN viewer karena Cloudinary sudah Public
    if (['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'].includes(extension)) {
        return (
            <div className="mb-4">
                {/* Area Viewer */}
                <div className="ratio ratio-4x3 shadow rounded overflow-hidden border bg-light mb-3">
                    <iframe 
                        src={getGoogleViewerUrl(url)} 
                        title="Document Viewer" 
                        className="w-100 h-100"
                        frameBorder="0"
                    ></iframe>
                </div>
                
                {/* Tombol Download Cadangan */}
                <div className="text-center">
                    <a 
                        href={getProxyDownloadUrl(url)} 
                        target="_blank" // Proxy backend akan handle attachment
                        className="btn btn-outline-primary btn-sm rounded-pill px-4"
                    >
                        <i className="bi bi-download me-2"></i> Download File Asli
                    </a>
                </div>
            </div>
        );
    }

    // 5. Default (ZIP/RAR/Lainnya) -> Hanya Download
    return (
        <div className="card mb-4 border-0 shadow-sm" style={{backgroundColor: '#f8f9fa'}}>
            <div className="card-body p-4 d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                    <i className="bi bi-file-earmark-arrow-down-fill fs-2 text-primary"></i>
                </div>
                <div className="flex-grow-1">
                    <h5 className="fw-bold mb-1">Materi Lampiran</h5>
                    <p className="text-muted mb-0 small">
                        File bertipe <strong>.{extension.toUpperCase()}</strong> tersedia.
                    </p>
                </div>
                <a 
                    href={getProxyDownloadUrl(url)} 
                    target="_blank" 
                    className="btn btn-primary fw-bold px-4 py-2 rounded-pill"
                >
                    <i className="bi bi-download me-2"></i> Download
                </a>
            </div>
        </div>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: theme.bg 
      }}>
        <div className="text-center">
          <div className="spinner-border mb-3" style={{ color: theme.primary }}></div>
          <p style={{ color: theme.textSec }}>Memuat materi pembelajaran...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: theme.bg 
      }}>
        <div className="text-center">
          <i className="bi bi-exclamation-triangle" style={{ fontSize: '3rem', color: theme.danger }}></i>
          <h3 style={{ color: theme.textMain, marginTop: '1rem' }}>Materi tidak ditemukan</h3>
          <p style={{ color: theme.textSec }}>Materi pembelajaran yang Anda cari tidak tersedia.</p>
          <button 
            onClick={() => navigate(-1)}
            style={{
              padding: '10px 24px',
              marginTop: '1rem',
              backgroundColor: theme.primary,
              color: theme.white,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            <i className="bi bi-arrow-left me-2"></i> Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', paddingBottom: '60px' }}>
      <style>{styles}</style>
      
      {/* HERO HEADER - SIMPLIFIED & ELEGANT */}
      <div style={{
        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
        color: theme.white,
        padding: '28px 24px',
        position: 'sticky',
        top: '64px',
        zIndex: 100,
        boxShadow: theme.shadowHeavy,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: theme.white,
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(10px)',
              marginBottom: '12px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
              e.target.style.transform = 'translateX(-3px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              e.target.style.transform = 'translateX(0)';
            }}
          >
            <i className="bi bi-chevron-left me-1"></i> Kembali
          </button>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '800', 
            margin: '0',
            lineHeight: '1.2',
            letterSpacing: '-0.5px',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {lesson.title}
          </h1>
        </div>
      </div>

      {/* MAIN CONTENT - ELEGANT LAYOUT */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '40px' }}>
          {/* LEFT CONTENT - MAIN */}
          <div className="lesson-page-animate">
            {/* VIDEO/MEDIA PLAYER - PREMIUM */}
            <div style={{
              backgroundColor: theme.white,
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: theme.shadowMedium,
              marginBottom: '32px',
              border: `1px solid ${theme.border}`,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = theme.shadowHeavy;
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = theme.shadowMedium;
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ position: 'relative', backgroundColor: '#000' }}>
                {renderContent(lesson.video_url)}
              </div>
            </div>

            {/* DESCRIPTION - ELEGANT CARD */}
            <div style={{
              backgroundColor: theme.white,
              borderRadius: '16px',
              padding: '32px',
              boxShadow: theme.shadowSoft,
              marginBottom: '32px',
              border: `1px solid ${theme.border}`,
              transition: 'all 0.3s ease'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: `2px solid ${theme.primaryLight}`
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: theme.primaryLight,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="bi bi-file-text" style={{ color: theme.primary, fontSize: '20px' }}></i>
                </div>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: theme.textMain,
                  margin: '0'
                }}>
                  Deskripsi Materi
                </h2>
              </div>
              <div style={{ 
                lineHeight: '1.8', 
                fontSize: '15px', 
                color: theme.textSec,
                borderLeft: `4px solid ${theme.primary}`,
                paddingLeft: '20px',
                marginLeft: '0'
              }}>
                {lesson.content_text ? (
                  lesson.content_text.split('\n').map((par, idx) => (
                    <p key={idx} style={{ 
                      marginBottom: idx === lesson.content_text.split('\n').length - 1 ? '0' : '14px',
                      opacity: 0.95
                    }}>
                      {par}
                    </p>
                  ))
                ) : (
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#F0F9FF',
                    borderRadius: '10px',
                    textAlign: 'center',
                    color: theme.info
                  }}>
                    <i className="bi bi-info-circle me-2"></i>
                    Tidak ada deskripsi tambahan untuk materi ini.
                  </div>
                )}
              </div>
            </div>

            {/* COMPLETION BUTTON - ELEGANT */}
            <div style={{ textAlign: 'center', paddingTop: '8px' }}>
              <button 
                onClick={handleComplete}
                disabled={isCompleted}
                style={{
                  padding: '16px 56px',
                  fontSize: '16px',
                  fontWeight: '700',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: isCompleted ? 'default' : 'pointer',
                  backgroundColor: isCompleted ? theme.success : theme.primary,
                  color: theme.white,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isCompleted ? theme.shadowMedium : `0 4px 20px ${theme.primary}40`,
                  letterSpacing: '0.3px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!isCompleted) {
                    e.target.style.backgroundColor = theme.primaryHover;
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = `0 8px 24px ${theme.primary}50`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCompleted) {
                    e.target.style.backgroundColor = theme.primary;
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = `0 4px 20px ${theme.primary}40`;
                  }
                }}
              >
                {isCompleted ? (
                  <span><i className="bi bi-check-circle-fill me-2"></i> Materi Selesai</span>
                ) : (
                  <span><i className="bi bi-check2 me-2"></i> Tandai Selesai <i className="bi bi-arrow-right ms-2"></i></span>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT SIDEBAR - ELEGANT */}
          <div className="sidebar-animate" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* COURSE INFO - PREMIUM CARD */}
            {course && (
              <div style={{
                backgroundColor: theme.white,
                borderRadius: '16px',
                padding: '24px',
                boxShadow: theme.shadowSoft,
                border: `1px solid ${theme.border}`,
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = theme.shadowMedium;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = theme.shadowSoft;
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200px',
                  height: '200px',
                  background: `radial-gradient(circle, ${theme.primaryLight} 0%, transparent 70%)`,
                  opacity: 0.4,
                  pointerEvents: 'none'
                }}></div>
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: theme.primaryLight,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}>
                    <i className="bi bi-book" style={{ color: theme.primary, fontSize: '24px' }}></i>
                  </div>
                  
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: '700',
                    color: theme.textMain,
                    marginBottom: '8px',
                    lineHeight: '1.4'
                  }}>
                    {course.name}
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    color: theme.textSec,
                    marginBottom: '16px',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {course.description?.substring(0, 80)}...
                  </p>
                  <button 
                    onClick={() => navigate(`/courses/${courseId}`)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '13px',
                      fontWeight: '600',
                      backgroundColor: theme.primaryLight,
                      color: theme.primary,
                      border: `1.5px solid ${theme.primary}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = theme.primary;
                      e.target.style.color = theme.white;
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = theme.primaryLight;
                      e.target.style.color = theme.primary;
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <i className="bi bi-arrow-right me-1"></i> Lihat Kursus
                  </button>
                </div>
              </div>
            )}

            {/* PROGRESS CARD - PREMIUM */}
            <div style={{
              backgroundColor: theme.white,
              borderRadius: '16px',
              padding: '24px',
              boxShadow: theme.shadowSoft,
              border: `1px solid ${theme.border}`,
              transition: 'all 0.3s ease'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: `2px solid #F0F0F0`
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#E8F5E9',
                  borderRadius: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="bi bi-graph-up" style={{ color: theme.success, fontSize: '18px' }}></i>
                </div>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: theme.textMain,
                  margin: '0'
                }}>
                  Progres Pembelajaran
                </h3>
              </div>
              
              <div style={{
                padding: '20px',
                background: `linear-gradient(135deg, ${theme.primaryLight} 0%, #FFE8DC 100%)`,
                borderRadius: '12px',
                marginBottom: '16px',
                textAlign: 'center',
                border: `2px solid ${theme.primary}20`
              }}>
                <p style={{
                  margin: '0',
                  fontSize: '32px',
                  fontWeight: '800',
                  color: theme.primary,
                  letterSpacing: '-1px'
                }}>
                  {isCompleted ? '100%' : '0%'}
                </p>
                <p style={{
                  margin: '6px 0 0 0',
                  fontSize: '12px',
                  color: theme.textSec,
                  fontWeight: '500'
                }}>
                  Status Materi Ini
                </p>
              </div>
              
              <div style={{
                padding: '14px 16px',
                backgroundColor: '#EFF6FF',
                borderRadius: '12px',
                textAlign: 'center',
                borderLeft: `4px solid ${theme.info}`,
                fontSize: '12px',
                color: '#0284C7',
                fontWeight: '500',
                lineHeight: '1.5'
              }}>
                <i className="bi bi-lightbulb me-2"></i>
                {isCompleted ? '✓ Anda sudah menyelesaikan materi ini!' : 'Klik tombol di atas untuk menandai selesai'}
              </div>
            </div>

            {/* TIPS CARD - REMOVED FOR CLEANER DESIGN */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;