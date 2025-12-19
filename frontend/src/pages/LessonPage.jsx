import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const LessonPage = () => {
  // Destructure params sesuai router Anda
  const { id, moduleId, courseId } = useParams();
  const navigate = useNavigate();
  
  // State Management
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]); // Array ini harus berisi detail lessons
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Ambil user dari LocalStorage
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  }, []);

  // --- THEME CONFIGURATION ---
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

  // --- ANIMATIONS & STYLES ---
  const styles = `
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
    .lesson-page-animate { animation: fadeInUp 0.6s ease-out; }
    .sidebar-animate { animation: slideInRight 0.6s ease-out; }
    
    /* Custom Scrollbar for Sidebar */
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #FF7E3E; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D55A1E; }
  `;

  // --- MAIN EFFECT: DATA FETCHING ---
  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true);
        
        // 1. Ambil Detail Lesson saat ini
        // Mengirim student_id agar Backend bisa cek tabel 'LessonCompletion'
        const endpoint = user ? `/lessons/${id}?student_id=${user.id}` : `/lessons/${id}`;
        const res = await api.get(endpoint);
        
        setLesson(res.data.lesson);
        // Set status completed dari database (Persistent)
        setIsCompleted(res.data.lesson.completed || false);
        
        // 2. Tentukan Course ID yang aktif
        const activeCourseId = courseId || res.data.lesson.course_id;

        // 3. Ambil Detail Course & Modules (Beserta Isinya)
        if (activeCourseId) {
          const courseRes = await api.get(`/courses/${activeCourseId}`);
          setCourse(courseRes.data.course);
          
          // Ambil daftar modul
          const modulesRes = await api.get(`/courses/${activeCourseId}/modules`);
          
          // [CRITICAL FIX] 
          // Kita harus melakukan looping untuk mengambil daftar LESSON di dalam setiap modul
          // Tanpa ini, sidebar akan kosong (hanya judul modul, tanpa lesson).
          const detailedModules = await Promise.all(
            modulesRes.data.modules.map(async (mod) => {
               try {
                 const lessonsRes = await api.get(`/modules/${mod.id}/lessons`);
                 // (Opsional) Ambil assignments jika perlu
                 // const assignsRes = await api.get(`/modules/${mod.id}/assignments`);
                 
                 return { 
                    ...mod, 
                    lessons: lessonsRes.data.lessons || [] 
                 };
               } catch (err) {
                 console.error("Gagal load detail modul:", err);
                 return { ...mod, lessons: [] };
               }
            })
          );
          
          setModules(detailedModules);
        }
      } catch (err) {
        console.error("Gagal load lesson:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessonData();
  }, [id, courseId, user?.id]);

  // --- LOGIC: AUTO NEXT LESSON ---
  const goToNextLesson = () => {
    if (!modules || modules.length === 0) return;

    let foundCurrent = false;
    let nextLessonId = null;

    // Loop Nested: Modules -> Lessons
    for (const mod of modules) {
        if (mod.lessons && mod.lessons.length > 0) {
            for (const l of mod.lessons) {
                if (foundCurrent) {
                    nextLessonId = l.id;
                    break; // Ketemu lesson berikutnya!
                }
                // Pakai String() biar aman (kadang ID angka vs string)
                if (String(l.id) === String(lesson.id)) {
                    foundCurrent = true;
                }
            }
        }
        if (nextLessonId) break;
    }

    if (nextLessonId) {
        // Redirect ke lesson berikutnya
        const targetUrl = courseId 
            ? `/course/${courseId}/lesson/${nextLessonId}` 
            : `/lesson/${nextLessonId}`;
        
        navigate(targetUrl);
        window.scrollTo(0, 0);
    } else {
        alert("Selamat! Anda telah mencapai akhir materi kursus ini. 🎉");
    }
  };

  // --- LOGIC: MARK AS COMPLETE ---
  const handleComplete = async () => {
    if (!user) return;
    try {
      await api.post(`/lessons/${id}/complete`, {
        student_id: user.id
      });
      setIsCompleted(true);
      
      // Popup Konfirmasi Pindah
      if(window.confirm("Selamat! Materi selesai. Lanjut ke materi berikutnya?")) {
          goToNextLesson();
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan progress. Cek koneksi internet.");
    }
  };

  // --- HELPER: Proxy Download ---
  const getProxyDownloadUrl = (fileUrl) => {
    if (!fileUrl) return '#';
    return `${api.defaults.baseURL}/proxy_download?url=${encodeURIComponent(fileUrl)}`;
  };

  // --- HELPER: Google Viewer URL ---
  const getGoogleViewerUrl = (fileUrl) => {
     return `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
  };

  // --- RENDERER: CONTENT TYPES ---
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

    // Ambil ekstensi file
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
                        target="_blank" 
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

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: theme.bg }}>
        <div className="text-center">
          <div className="spinner-border mb-3" style={{ color: theme.primary }}></div>
          <p style={{ color: theme.textSec }}>Memuat materi pembelajaran...</p>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (!lesson) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: theme.bg }}>
        <div className="text-center">
          <i className="bi bi-exclamation-triangle" style={{ fontSize: '3rem', color: theme.danger }}></i>
          <h3 style={{ color: theme.textMain, marginTop: '1rem' }}>Materi tidak ditemukan</h3>
          <button 
            onClick={() => navigate(-1)}
            style={{ padding: '10px 24px', marginTop: '1rem', backgroundColor: theme.primary, color: theme.white, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
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
      
      {/* --- HERO HEADER --- */}
      <div style={{
        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
        color: theme.white, padding: '28px 24px', position: 'sticky', top: '64px', zIndex: 100,
        boxShadow: theme.shadowHeavy, backdropFilter: 'blur(10px)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{
              background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.25)',
              color: theme.white, padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
              fontSize: '13px', fontWeight: '500', transition: 'all 0.3s ease', backdropFilter: 'blur(10px)', marginBottom: '12px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
          >
            <i className="bi bi-chevron-left me-1"></i> Kembali
          </button>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0', lineHeight: '1.2', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {lesson.title}
          </h1>
        </div>
      </div>

      {/* --- MAIN LAYOUT GRID --- */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: sidebarOpen ? '1fr 320px' : '1fr', gap: '40px', transition: 'all 0.3s ease' }}>
          
          {/* --- LEFT: MAIN CONTENT AREA --- */}
          <div className="lesson-page-animate">
            
            {/* Video / Content Player */}
            <div style={{
              backgroundColor: theme.white, borderRadius: '16px', overflow: 'hidden',
              boxShadow: theme.shadowMedium, marginBottom: '32px', border: `1px solid ${theme.border}`,
              position: 'relative'
            }}>
              <div style={{ position: 'relative', backgroundColor: '#000' }}>
                {renderContent(lesson.video_url)}
              </div>
            </div>

            {/* Description Card */}
            <div style={{
              backgroundColor: theme.white, borderRadius: '16px', padding: '32px',
              boxShadow: theme.shadowSoft, marginBottom: '32px', border: `1px solid ${theme.border}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: `2px solid ${theme.primaryLight}` }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: theme.primaryLight, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-file-text" style={{ color: theme.primary, fontSize: '20px' }}></i>
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: theme.textMain, margin: '0' }}>Deskripsi Materi</h2>
              </div>
              <div style={{ lineHeight: '1.8', fontSize: '15px', color: theme.textSec, borderLeft: `4px solid ${theme.primary}`, paddingLeft: '20px' }}>
                {lesson.content_text ? (
                  lesson.content_text.split('\n').map((par, idx) => (
                    <p key={idx} style={{ marginBottom: '14px' }}>{par}</p>
                  ))
                ) : (
                  <div style={{ padding: '16px', backgroundColor: '#F0F9FF', borderRadius: '10px', textAlign: 'center', color: theme.info }}>
                    <i className="bi bi-info-circle me-2"></i> Tidak ada deskripsi tambahan.
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons (Complete / Next) */}
            <div style={{ textAlign: 'center', paddingTop: '8px' }}>
              <button 
                onClick={handleComplete}
                disabled={isCompleted}
                style={{
                  padding: '16px 56px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', border: 'none',
                  cursor: isCompleted ? 'default' : 'pointer',
                  backgroundColor: isCompleted ? theme.success : theme.primary,
                  color: theme.white,
                  boxShadow: isCompleted ? theme.shadowMedium : `0 4px 20px ${theme.primary}40`,
                  transition: 'all 0.3s ease',
                  opacity: isCompleted ? 0.9 : 1
                }}
              >
                {isCompleted ? (
                  <span><i className="bi bi-check-circle-fill me-2"></i> Materi Selesai</span>
                ) : (
                  <span><i className="bi bi-check2 me-2"></i> Tandai Selesai <i className="bi bi-arrow-right ms-2"></i></span>
                )}
              </button>

              {/* Tombol Lanjut Manual */}
              {isCompleted && (
                  <div style={{marginTop: '20px'}}>
                      <button 
                        onClick={goToNextLesson}
                        className="btn btn-outline-dark rounded-pill px-4"
                        style={{fontSize: '14px', fontWeight: '600', padding: '10px 24px'}}
                      >
                          Lanjut Materi Berikutnya <i className="bi bi-arrow-right ms-1"></i>
                      </button>
                  </div>
              )}
            </div>
          </div>

          {/* --- RIGHT: SIDEBAR (NAVIGATION) --- */}
          {sidebarOpen && (
            <div className="sidebar-animate" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Course Info Card */}
              {course && (
                <div style={{
                  backgroundColor: theme.white, borderRadius: '16px', padding: '24px',
                  boxShadow: theme.shadowSoft, border: `1px solid ${theme.border}`, position: 'relative', overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', top: '-50%', right: '-50%', width: '200px', height: '200px', background: `radial-gradient(circle, ${theme.primaryLight} 0%, transparent 70%)`, opacity: 0.4 }}></div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: theme.textMain, marginBottom: '8px' }}>{course.title}</h3>
                    <p style={{ fontSize: '13px', color: theme.textSec, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {course.description?.substring(0, 80)}...
                    </p>
                    <button 
                      onClick={() => navigate(`/course/${courseId || course.id}`)}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '13px', fontWeight: '600', backgroundColor: theme.primaryLight, color: theme.primary, border: `1.5px solid ${theme.primary}`, borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease' }}
                    >
                      <i className="bi bi-arrow-left me-1"></i> Kembali ke Daftar Isi
                    </button>
                  </div>
                </div>
              )}

              {/* Progress Card */}
              <div style={{ backgroundColor: theme.white, borderRadius: '16px', padding: '24px', boxShadow: theme.shadowSoft, border: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: `2px solid #F0F0F0` }}>
                  <i className="bi bi-graph-up" style={{ color: theme.success, fontSize: '18px' }}></i>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: theme.textMain, margin: '0' }}>Status</h3>
                </div>
                <div style={{ padding: '20px', background: `linear-gradient(135deg, ${theme.primaryLight} 0%, #FFE8DC 100%)`, borderRadius: '12px', marginBottom: '16px', textAlign: 'center', border: `2px solid ${theme.primary}20` }}>
                  <p style={{ margin: '0', fontSize: '32px', fontWeight: '800', color: theme.primary }}>{isCompleted ? '100%' : '0%'}</p>
                  <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: theme.textSec, fontWeight: '500' }}>Status Materi Ini</p>
                </div>
                <div style={{ padding: '14px 16px', backgroundColor: '#EFF6FF', borderRadius: '12px', textAlign: 'center', borderLeft: `4px solid ${theme.info}`, fontSize: '12px', color: '#0284C7', fontWeight: '500' }}>
                  <i className="bi bi-lightbulb me-2"></i> {isCompleted ? '✓ Anda sudah menyelesaikan materi ini!' : 'Klik tombol di atas untuk menandai selesai'}
                </div>
              </div>

              {/* SIDEBAR LIST (Daftar Materi) */}
              <div className="custom-scrollbar" style={{ 
                  backgroundColor: theme.white, borderRadius: '16px', overflow: 'hidden', 
                  boxShadow: theme.shadowSoft, border: `1px solid ${theme.border}`, 
                  maxHeight: '600px', overflowY: 'auto' 
              }}>
                  <div style={{ padding: '15px 20px', backgroundColor: '#FAFAFA', borderBottom: `1px solid ${theme.border}` }}>
                     <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: theme.textMain }}>Daftar Materi</h5>
                  </div>
                  
                  {/* LOOPING MODULES & LESSONS */}
                  {modules.map((mod, idx) => (
                      <div key={mod.id}>
                          {/* Judul Modul */}
                          <div style={{ 
                              padding: '12px 20px', backgroundColor: '#F9FAFB', 
                              borderBottom: '1px solid #EEE', borderTop: idx > 0 ? '1px solid #EEE' : 'none',
                              fontSize: '12px', fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' 
                          }}>
                              Modul {idx + 1}: {mod.title}
                          </div>

                          {/* Daftar Lesson dalam Modul */}
                          {mod.lessons && mod.lessons.map((l) => {
                              const isActive = String(l.id) === String(lesson.id);
                              return (
                                <div 
                                    key={l.id}
                                    onClick={() => {
                                        const url = courseId ? `/course/${courseId}/lesson/${l.id}` : `/lesson/${l.id}`;
                                        navigate(url);
                                        window.scrollTo(0,0);
                                    }}
                                    style={{
                                        padding: '14px 20px',
                                        borderBottom: '1px solid #F0F0F0',
                                        cursor: 'pointer',
                                        backgroundColor: isActive ? theme.primaryLight : 'white',
                                        color: isActive ? theme.primary : theme.textMain,
                                        fontSize: '13px',
                                        fontWeight: isActive ? '600' : '400',
                                        borderLeft: isActive ? `4px solid ${theme.primary}` : '4px solid transparent',
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <i className={`bi ${isActive ? 'bi-play-circle-fill' : 'bi-play-circle'}`} style={{ fontSize: '16px', opacity: isActive ? 1 : 0.6 }}></i>
                                    <span style={{flex: 1}}>{l.title}</span>
                                    {isActive && <i className="bi bi-chevron-right" style={{fontSize: '10px'}}></i>}
                                </div>
                              );
                          })}
                          
                          {/* Fallback jika tidak ada lesson */}
                          {(!mod.lessons || mod.lessons.length === 0) && (
                              <div style={{ padding: '15px 20px', color: theme.textMuted, fontSize: '12px', fontStyle: 'italic', textAlign: 'center' }}>
                                  Belum ada materi
                              </div>
                          )}
                      </div>
                  ))}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LessonPage;