import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Swal from 'sweetalert2'; // Pastikan install: npm install sweetalert2

const CourseDetailPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollStatus, setEnrollStatus] = useState(null); 
  const [openModuleId, setOpenModuleId] = useState(null); 
  const [enrollKey, setEnrollKey] = useState('');
  const [hoveredLesson, setHoveredLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const user = JSON.parse(localStorage.getItem('user'));

  // --- ENHANCED THEME ---
  const theme = {
    primary: '#FF7E3E',
    primaryLight: '#FFF5F1',
    primaryHover: '#E56020',
    bg: '#FDF8F4',
    white: '#FFFFFF',
    textMain: '#2D2D2D',
    textSec: '#757575',
    textMuted: '#9CA3AF',
    border: '#F0F0F0',
    danger: '#FF4D4F',
    success: '#52C41A',
    warning: '#F59E0B',
    shadowSoft: '0 8px 30px rgba(0,0,0,0.04)',
    shadowHeavy: '0 15px 35px rgba(255, 126, 62, 0.15)',
    shadowMedium: '0 10px 25px rgba(255, 126, 62, 0.08)'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await api.get(`/courses/${id}`);
        setCourse(courseRes.data.course);

        const modulesRes = await api.get(`/courses/${id}/modules`);
        const detailedModules = await Promise.all(
          modulesRes.data.modules.map(async (mod) => {
             try {
               const lessons = await api.get(`/modules/${mod.id}/lessons`);
               const assigns = await api.get(`/modules/${mod.id}/assignments`);
               return { ...mod, lessons: lessons.data.lessons, assignments: assigns.data.assignments || [] };
             } catch (err) {
               return { ...mod, lessons: [], assignments: [] };
             }
          })
        );
        setModules(detailedModules);
        if(detailedModules.length > 0) setOpenModuleId(detailedModules[0].id);

        if (user) {
            try {
                const myCourses = await api.get(`/api/students/${user.id}/courses`);
                // Cek apakah course ID ini ada di daftar kursus saya
                // Pastikan tipe data sama (string/number) dengan ==
                if (myCourses.data.courses.some(c => c.id == id)) setEnrollStatus('success');
            } catch (err) {}
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user?.id]);

  const handleEnroll = async (e) => {
    e.preventDefault(); 
    if (!user) return navigate('/login');

    if (course.is_locked && !enrollKey && enrollStatus !== 'success') {
        Swal.fire('Terkunci', 'Kursus ini terkunci. Masukkan Enrollment Key.', 'warning');
        return;
    }

    try {
      await api.post('/enroll', {
        student_id: user.id,
        course_id: id,
        enrollment_key: enrollKey 
      });
      setEnrollStatus('success');
      Swal.fire('Berhasil!', 'Selamat belajar!', 'success');
    } catch (err) {
      const msg = err.response?.data?.error || "Gagal mendaftar";
      if (msg === 'Already enrolled') setEnrollStatus('success');
      else Swal.fire('Gagal', msg, 'error');
    }
  };

  // --- LOGIKA UNENROLL ---
  const handleUnenroll = async () => {
    if (!user) return;

    const result = await Swal.fire({
      title: 'Keluar dari Kursus?',
      text: "Progres belajar Anda mungkin akan hilang jika Anda keluar.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: theme.danger,
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await api.post('/unenroll', {
          user_id: user.id,
          course_id: id
        });
        
        setEnrollStatus(null); // Reset status enrollment
        Swal.fire(
          'Berhasil Keluar',
          'Anda telah membatalkan pendaftaran kursus ini.',
          'success'
        );
      } catch (error) {
        console.error(error);
        Swal.fire(
          'Gagal',
          error.response?.data?.message || 'Terjadi kesalahan saat unenroll.',
          'error'
        );
      }
    }
  };

  const checkAccess = () => enrollStatus === 'success';
  const toggleModule = (modId) => setOpenModuleId(openModuleId === modId ? null : modId);

  if (loading) return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: theme.bg,
      fontFamily: "'Poppins', sans-serif"
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          fontSize: '48px', 
          marginBottom: '16px', 
          animation: 'pulse 2s infinite',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: theme.primaryLight
        }}>
          <i className="bi bi-hourglass-split" style={{ fontSize: '28px', color: theme.primary }}></i>
        </div>
        <p style={{ color: theme.primary, fontWeight: '600', fontSize: '16px' }}>Memuat kursus...</p>
      </div>
    </div>
  );

  if (!course) return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: theme.bg,
      fontFamily: "'Poppins', sans-serif"
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          fontSize: '48px', 
          marginBottom: '16px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#FEE2E2'
        }}>
          <i className="bi bi-exclamation-triangle" style={{ fontSize: '28px', color: theme.danger }}></i>
        </div>
        <p style={{ color: theme.danger, fontWeight: '600', fontSize: '16px', marginBottom: '20px' }}>Kursus tidak ditemukan</p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '12px 24px',
            backgroundColor: theme.primary,
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', fontFamily: "'Poppins', sans-serif", margin: 0, padding: 0 }}>
      
      {/* Gradient Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '500px',
        background: `linear-gradient(135deg, ${theme.primaryLight}, rgba(255, 126, 62, 0.03))`,
        zIndex: -1,
        pointerEvents: 'none'
      }}></div>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
          @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css');
          * { font-family: 'Poppins', sans-serif; }
          body { margin: 0; padding: 0; }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .lesson-item { animation: slideDown 0.3s ease; }
          .tab-content { animation: fadeIn 0.3s ease; }
        `}
      </style>

      {/* HERO HEADER SECTION */}
      <div style={{
        background: `linear-gradient(135deg, ${theme.primary}, #FF6B6B)`,
        color: 'white',
        paddingTop: '0px',
        paddingBottom: '60px',
        position: 'relative',
        overflow: 'hidden',
        marginTop: '-16px'
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%', transform: 'translate(100px, -100px)' }}></div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '200px', height: '200px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%', transform: 'translate(-50px, 50px)' }}></div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 0 24px', position: 'relative', zIndex: 1 }}>
          
          {/* Back Button & Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <button 
              onClick={() => navigate('/')} 
              style={{
                background: 'rgba(255,255,255,0.2)', 
                border: 'none', 
                color: 'white', 
                cursor: 'pointer', 
                fontWeight: '600', 
                fontSize: '15px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                transition: 'all 0.2s ease',
                padding: '10px 16px',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.3)';
                e.target.style.transform = 'translateX(-4px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
                e.target.style.transform = 'translateX(0)';
              }}
            >
              <i className="bi bi-arrow-left" style={{ fontSize: '16px' }}></i> Kembali
            </button>
            {checkAccess() && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255,255,255,0.25)',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '50px',
                fontSize: '13px',
                fontWeight: '600',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                <i className="bi bi-check-circle-fill"></i> Sudah Terdaftar
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{
                backgroundColor: 'rgba(255,255,255,0.25)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '50px',
                fontSize: '12px',
                fontWeight: '700',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                {course.category || 'Umum'}
              </span>
              {course.is_locked && (
                <span style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '50px',
                  fontSize: '12px',
                  fontWeight: '700',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <i className="bi bi-lock-fill"></i> Premium
                </span>
              )}
            </div>
            
            <h1 style={{ fontSize: '52px', fontWeight: '800', marginBottom: '16px', lineHeight: '1.1', letterSpacing: '-1px' }}>
              {course.title}
            </h1>
          </div>

          {/* Course Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap', marginTop: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="bi bi-star-fill" style={{ fontSize: '18px' }}></i>
              <span style={{ fontWeight: '600' }}>4.8</span>
              <span style={{ opacity: 0.9 }}>(120 Ulasan)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="bi bi-person-fill" style={{ fontSize: '18px' }}></i>
              <span style={{ fontWeight: '600' }}>Tim EduPlatform</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="bi bi-book-fill" style={{ fontSize: '18px' }}></i>
              <span style={{ fontWeight: '600' }}>{modules.length} Modul</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="bi bi-people-fill" style={{ fontSize: '18px' }}></i>
              <span style={{ fontWeight: '600' }}>2,500+ Siswa</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '50px 24px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '50px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN - CONTENT */}
        <div>
          
          {/* TAB NAVIGATION */}
          <div style={{
            display: 'flex',
            gap: '0',
            marginBottom: '40px',
            borderBottom: `2px solid ${theme.border}`,
            backgroundColor: theme.white,
            borderRadius: '16px 16px 0 0',
            overflow: 'hidden',
            boxShadow: `0 4px 12px rgba(0,0,0,0.02)`
          }}>
            {['overview', 'curriculum', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '16px 24px',
                  border: 'none',
                  backgroundColor: activeTab === tab ? theme.primary : 'transparent',
                  color: activeTab === tab ? 'white' : theme.textSec,
                  fontWeight: activeTab === tab ? '700' : '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'capitalize',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab) {
                    e.target.style.backgroundColor = theme.primaryLight;
                    e.target.style.color = theme.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = theme.textSec;
                  }
                }}
              >
                {tab === 'overview' && <i className="bi bi-info-circle"></i>}
                {tab === 'curriculum' && <i className="bi bi-collection"></i>}
                {tab === 'reviews' && <i className="bi bi-chat-left-dots"></i>}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          <div className="tab-content">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div style={{ backgroundColor: theme.white, borderRadius: '0 16px 16px 16px', padding: '40px', boxShadow: `0 4px 12px rgba(0,0,0,0.02)` }}>
                <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="bi bi-info-circle-fill" style={{ color: theme.primary }}></i>
                  Tentang Kursus Ini
                </h3>
                <p style={{ fontSize: '15px', lineHeight: '1.8', color: theme.textSec, marginBottom: '24px' }}>
                  {course.description}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
                  <div style={{ padding: '20px', backgroundColor: theme.primaryLight, borderRadius: '12px', border: `2px solid ${theme.primary}20` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <i className="bi bi-clock-history" style={{ fontSize: '20px', color: theme.primary }}></i>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase' }}>Durasi</div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: theme.primary }}>12 Jam</div>
                  </div>

                  <div style={{ padding: '20px', backgroundColor: '#F0F9FF', borderRadius: '12px', border: '2px solid #3B82F620' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <i className="bi bi-graph-up" style={{ fontSize: '20px', color: '#3B82F6' }}></i>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase' }}>Level</div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#3B82F6' }}>Pemula</div>
                  </div>

                  <div style={{ padding: '20px', backgroundColor: '#F0FDF4', borderRadius: '12px', border: '2px solid #10B98120' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <i className="bi bi-people-fill" style={{ fontSize: '20px', color: '#10B981' }}></i>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase' }}>Siswa</div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>2,500+</div>
                  </div>
                </div>
              </div>
            )}

            {/* CURRICULUM TAB */}
            {activeTab === 'curriculum' && (
              <div style={{ backgroundColor: theme.white, borderRadius: '0 16px 16px 16px', overflow: 'hidden', boxShadow: `0 4px 12px rgba(0,0,0,0.02)` }}>
                <h3 style={{ fontSize: '24px', fontWeight: '700', padding: '40px 40px 20px', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="bi bi-collection-fill" style={{ color: theme.primary }}></i>
                  Materi Pembelajaran
                </h3>
                <div style={{ padding: '0 40px 40px' }}>
                  {modules.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: theme.textMuted }}>
                      <i className="bi bi-inbox" style={{ fontSize: '48px', display: 'block', marginBottom: '16px', opacity: 0.3 }}></i>
                      Materi belum tersedia
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {modules.map((modul, idx) => (
                        <div key={modul.id} style={{
                          border: `2px solid ${openModuleId === modul.id ? theme.primary : theme.border}`,
                          borderRadius: '12px',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease'
                        }} className="lesson-item">
                          
                          <div 
                            onClick={() => toggleModule(modul.id)}
                            style={{ 
                              padding: '20px 24px', 
                              backgroundColor: openModuleId === modul.id ? theme.primaryLight : theme.white, 
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = theme.primaryLight;
                            }}
                            onMouseLeave={(e) => {
                              if (openModuleId !== modul.id) e.currentTarget.style.backgroundColor = theme.white;
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                              <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '10px',
                                backgroundColor: theme.primary,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '18px'
                              }}>
                                {idx + 1}
                              </div>
                              <div>
                                <div style={{ fontWeight: '700', fontSize: '16px', color: theme.textMain, marginBottom: '4px' }}>
                                  {modul.title}
                                </div>
                                <div style={{ fontSize: '13px', color: theme.textMuted }}>
                                  <i className="bi bi-play-circle" style={{ marginRight: '6px' }}></i>
                                  {modul.lessons.length} Pelajaran • 
                                  <i className="bi bi-file-earmark-text" style={{ margin: '0 6px' }}></i>
                                  {modul.assignments.length} Tugas
                                </div>
                              </div>
                            </div>
                            <i className={`bi bi-chevron-down`} style={{ 
                              fontSize: '18px', 
                              color: theme.primary,
                              transform: openModuleId === modul.id ? 'rotate(180deg)' : 'rotate(0deg)', 
                              transition: '0.3s',
                              fontWeight: '700'
                            }}></i>
                          </div>

                          {/* Module Content */}
                          {openModuleId === modul.id && (
                            <div style={{ backgroundColor: '#FAFAFA', borderTop: `1px solid ${theme.border}` }}>
                              {modul.lessons.length > 0 && (
                                <div>
                                  <div style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: theme.primaryLight }}>
                                    <i className="bi bi-play-circle"></i> Pelajaran
                                  </div>
                                  {modul.lessons.map((lesson, lIdx) => (
                                    <div 
                                      key={lesson.id}
                                      onMouseEnter={() => setHoveredLesson(lesson.id)}
                                      onMouseLeave={() => setHoveredLesson(null)}
                                      onClick={() => (checkAccess() || lesson.is_preview) ? navigate(`/lesson/${lesson.id}`) : Swal.fire('Terkunci', 'Anda harus mendaftar dulu.', 'info')}
                                      style={{
                                        padding: '14px 24px 14px 60px',
                                        borderBottom: `1px solid ${theme.border}`,
                                        backgroundColor: hoveredLesson === lesson.id ? theme.primaryLight : 'transparent',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                          <i className="bi bi-play-fill" style={{ fontSize: '16px', color: theme.primary }}></i>
                                          <span style={{ fontSize: '14px', fontWeight: '500', color: (checkAccess() || lesson.is_preview) ? theme.textMain : theme.textMuted }}>
                                            {lIdx + 1}. {lesson.title}
                                          </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                          {lesson.is_preview && <span style={{ fontSize: '11px', backgroundColor: '#ECFDF5', color: '#059669', padding: '4px 8px', borderRadius: '6px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><i className="bi bi-eye-fill"></i> Preview</span>}
                                          {!checkAccess() && !lesson.is_preview && <i className="bi bi-lock-fill" style={{ fontSize: '14px', color: theme.textMuted }}></i>}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {modul.assignments.length > 0 && (
                                <div style={{ borderTop: `1px solid ${theme.border}` }}>
                                  <div style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FEF3C7' }}>
                                    <i className="bi bi-file-earmark-text"></i> Tugas
                                  </div>
                                  {modul.assignments.map((assign, aIdx) => (
                                    <div 
                                      key={assign.id}
                                      onMouseEnter={() => setHoveredLesson(assign.id)}
                                      onMouseLeave={() => setHoveredLesson(null)}
                                      onClick={() => checkAccess() ? navigate(`/assignment/${assign.id}`) : Swal.fire('Terkunci', 'Anda harus mendaftar dulu.', 'info')}
                                      style={{
                                        padding: '14px 24px 14px 60px',
                                        borderBottom: `1px solid ${theme.border}`,
                                        backgroundColor: hoveredLesson === assign.id ? '#FEF3C7' : 'transparent',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                          <i className="bi bi-pencil-square" style={{ fontSize: '16px', color: '#D97706' }}></i>
                                          <span style={{ fontSize: '14px', fontWeight: '500', color: theme.textMain }}>
                                            Tugas {aIdx + 1}: {assign.title}
                                          </span>
                                        </div>
                                        {!checkAccess() && <i className="bi bi-lock-fill" style={{ fontSize: '14px', color: theme.textMuted }}></i>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {modul.lessons.length === 0 && modul.assignments.length === 0 && (
                                <div style={{ padding: '20px', textAlign: 'center', color: theme.textMuted, fontSize: '13px' }}>
                                  <i className="bi bi-inbox" style={{ fontSize: '32px', display: 'block', marginBottom: '8px', opacity: 0.3 }}></i>
                                  Materi belum ditambahkan
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div style={{ backgroundColor: theme.white, borderRadius: '0 16px 16px 16px', padding: '40px', boxShadow: `0 4px 12px rgba(0,0,0,0.02)` }}>
                <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '30px', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="bi bi-chat-left-dots-fill" style={{ color: theme.primary }}></i>
                  Ulasan dari Siswa (120)
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ paddingBottom: '24px', borderBottom: `1px solid ${theme.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: theme.primaryLight,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: theme.primary,
                          fontWeight: '700'
                        }}>
                          {i === 1 ? 'SA' : i === 2 ? 'BW' : 'CR'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: theme.textMain, fontSize: '14px' }}>
                            {i === 1 ? 'Siti Aminah' : i === 2 ? 'Budi Wirawan' : 'Citra Rahmadani'}
                          </div>
                          <div style={{ fontSize: '12px', color: theme.textMuted }}>
                            <i className="bi bi-star-fill" style={{ color: '#F59E0B', marginRight: '4px' }}></i>
                            <span style={{ fontWeight: '600', marginRight: '8px' }}>5.0</span>
                            {i === 1 ? '• 2 minggu lalu' : i === 2 ? '• 1 bulan lalu' : '• 2 bulan lalu'}
                          </div>
                        </div>
                      </div>
                      <p style={{ fontSize: '14px', color: theme.textSec, lineHeight: '1.6' }}>
                        {i === 1 ? 'Kursus ini sangat informatif dan mudah dipahami. Instruktur menjelaskan dengan sangat baik!' : i === 2 ? 'Materi sangat lengkap dan up-to-date. Saya merekomendasikan kursus ini untuk semua.' : 'Sangat puas dengan kualitas pembelajaran dan sertifikatnya. Terima kasih!'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - STICKY SIDEBAR */}
        <div>
          <div style={{
            position: 'sticky',
            top: '40px',
            backgroundColor: theme.white,
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: `0 20px 50px rgba(255, 126, 62, 0.08)`,
            border: `1px solid ${theme.border}`
          }}>
            
            {/* Image */}
            <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
              <img 
                src={course.thumbnail_url || 'https://via.placeholder.com/400x300'} 
                alt="Thumbnail" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  transition: 'transform 0.5s ease'
                }}
                onMouseOver={e => e.target.style.transform = 'scale(1.08)'}
                onMouseOut={e => e.target.style.transform = 'scale(1.0)'}
              />
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.15) 100%)',
                pointerEvents: 'none'
              }}></div>
            </div>

            {/* Content */}
            <div style={{ padding: '32px 28px' }}>
              
              {checkAccess() ? (
                <div style={{ textAlign: 'center' }}>
                   <div style={{ width: '70px', height: '70px', backgroundColor: '#D1FAE5', color: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px auto', boxShadow: `0 4px 12px rgba(5, 150, 105, 0.2)` }}>
                       <i className="bi bi-check-circle-fill"></i>
                   </div>
                   <h4 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: theme.textMain }}>Sudah Terdaftar</h4>
                   <p style={{ fontSize: '14px', color: theme.textMuted, marginBottom: '28px', lineHeight: 1.5 }}>Lanjutkan progres belajarmu dan raih sertifikasi!</p>
                   
                   <button 
                      onClick={() => {
                          if(modules[0]?.lessons[0]) navigate(`/lesson/${modules[0].lessons[0].id}`);
                          else Swal.fire('Info', 'Materi belum tersedia', 'info');
                      }}
                      style={{
                          width: '100%',
                          padding: '14px 24px',
                          backgroundColor: theme.primary,
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          fontWeight: '700',
                          fontSize: '15px',
                          cursor: 'pointer',
                          boxShadow: `0 10px 25px ${theme.primary}25`,
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          marginBottom: '16px'
                      }}
                      onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = `0 12px 30px ${theme.primary}40`;
                      }}
                      onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = `0 10px 25px ${theme.primary}25`;
                      }}
                  >
                      <i className="bi bi-play-circle-fill"></i> Lanjut Belajar
                  </button>

                  {/* TOMBOL UNENROLL */}
                  <button 
                      onClick={handleUnenroll}
                      style={{
                          width: '100%',
                          padding: '10px 24px',
                          backgroundColor: 'transparent',
                          color: theme.danger,
                          border: `1px solid ${theme.danger}40`,
                          borderRadius: '12px',
                          fontWeight: '600',
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#FEF2F2';
                      }}
                      onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                      }}
                  >
                      <i className="bi bi-box-arrow-right"></i> Batal Gabung
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
                      <div>
                          <span style={{ fontSize: '13px', color: theme.textMuted, display: 'block', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Harga Kursus</span>
                          <span style={{ fontSize: '36px', fontWeight: '800', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {course.is_locked ? 'Premium' : (
                                <>
                                  <i className="bi bi-gift-fill" style={{ color: theme.success }}></i> Gratis
                                </>
                              )}
                          </span>
                      </div>
                      {course.is_locked && (
                          <div style={{
                              backgroundColor: '#FEE2E2',
                              color: '#DC2626',
                              padding: '8px 14px',
                              borderRadius: '100px',
                              fontSize: '12px',
                              fontWeight: '700',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                          }}>
                              <i className="bi bi-lock-fill"></i> Terkunci
                          </div>
                      )}
                  </div>
                  
                  {course.is_locked && (
                      <div style={{ marginBottom: '20px' }}>
                          <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textMain, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <i className="bi bi-key-fill" style={{ color: theme.primary }}></i> Kunci Akses
                          </label>
                          <input 
                              type="text" 
                              placeholder="Masukkan kunci akses..."
                              value={enrollKey}
                              onChange={(e) => setEnrollKey(e.target.value)}
                              style={{
                                  width: '100%',
                                  padding: '12px 14px',
                                  borderRadius: '10px',
                                  border: '2px solid ' + (enrollKey ? theme.primary : theme.border),
                                  outline: 'none',
                                  fontSize: '14px',
                                  boxSizing: 'border-box',
                                  backgroundColor: '#F9FAFB',
                                  fontWeight: '500',
                                  fontFamily: 'Poppins, sans-serif',
                                  transition: 'all 0.2s ease',
                                  boxShadow: enrollKey ? `0 0 0 3px ${theme.primaryLight}` : 'none'
                              }}
                          />
                      </div>
                  )}

                  <button 
                    onClick={handleEnroll} 
                    style={{
                        width: '100%',
                        padding: '14px 24px',
                        backgroundColor: theme.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '15px',
                        cursor: 'pointer',
                        boxShadow: `0 10px 25px ${theme.primary}25`,
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = `0 12px 30px ${theme.primary}40`;
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = `0 10px 25px ${theme.primary}25`;
                    }}
                  >
                      {course.is_locked ? (
                        <>
                          <i className="bi bi-unlock-fill"></i> Buka Akses Sekarang
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check2-circle"></i> Daftar Gratis
                        </>
                      )}
                  </button>

                  <p style={{ textAlign: 'center', fontSize: '12px', color: theme.textMuted, marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <i className="bi bi-shield-check"></i> Garansi uang kembali 30 hari
                  </p>
                </div>
              )}

              {/* Features */}
              <div style={{ marginTop: '32px', borderTop: `2px solid ${theme.border}`, paddingTop: '24px' }}>
                  <h5 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="bi bi-star-fill" style={{ color: theme.primary }}></i>
                      Benefit Kursus:
                  </h5>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', color: theme.textSec, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <li style={{display: 'flex', gap: '10px', alignItems: 'flex-start'}}>
                        <i className="bi bi-infinity" style={{fontSize: '14px', color: theme.primary, marginTop: '2px', flexShrink: 0}}></i> 
                        <span>Akses penuh seumur hidup</span>
                      </li>
                      <li style={{display: 'flex', gap: '10px', alignItems: 'flex-start'}}>
                        <i className="bi bi-phone" style={{fontSize: '14px', color: theme.primary, marginTop: '2px', flexShrink: 0}}></i> 
                        <span>Akses di semua perangkat</span>
                      </li>
                      <li style={{display: 'flex', gap: '10px', alignItems: 'flex-start'}}>
                        <i className="bi bi-award" style={{fontSize: '14px', color: theme.primary, marginTop: '2px', flexShrink: 0}}></i> 
                        <span>Sertifikat digital kelulusan</span>
                      </li>
                      <li style={{display: 'flex', gap: '10px', alignItems: 'flex-start'}}>
                        <i className="bi bi-chat-dots" style={{fontSize: '14px', color: theme.primary, marginTop: '2px', flexShrink: 0}}></i> 
                        <span>Dukungan komunitas 24/7</span>
                      </li>
                  </ul>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CourseDetailPage;