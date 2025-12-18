import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CourseDetailPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollStatus, setEnrollStatus] = useState(null); 
  const [openModuleId, setOpenModuleId] = useState(null); 
  const [enrollKey, setEnrollKey] = useState(''); 

  const user = JSON.parse(localStorage.getItem('user'));

  // --- CONFIG THEME ---
  const theme = {
    primary: '#FF7E3E',       // Oranye Utama
    primaryHover: '#E56020',  // Oranye Gelap (Hover)
    bg: '#FDF8F4',            // Krem Latar
    white: '#FFFFFF',
    textMain: '#2D2D2D',      // Hitam Soft (Poppins looks great with soft black)
    textSec: '#757575',       // Abu-abu
    border: '#F0F0F0',
    danger: '#FF4D4F',
    success: '#52C41A',
    shadowSoft: '0 8px 30px rgba(0,0,0,0.04)',
    shadowHover: '0 15px 35px rgba(255, 126, 62, 0.15)'
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
                const myCourses = await api.get(`/students/${user.id}/courses`);
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
        alert("🔒 Kursus ini terkunci. Masukkan Enrollment Key.");
        return;
    }

    try {
      await api.post('/enroll', {
        student_id: user.id,
        course_id: id,
        enrollment_key: enrollKey 
      });
      setEnrollStatus('success');
      alert("🎉 Berhasil Mendaftar!");
    } catch (err) {
      const msg = err.response?.data?.error || "Gagal mendaftar";
      if (msg === 'Already enrolled') setEnrollStatus('success');
      else alert("Gagal: " + msg);
    }
  };

  const checkAccess = () => enrollStatus === 'success';
  const toggleModule = (modId) => setOpenModuleId(openModuleId === modId ? null : modId);

  if (loading) return <div style={styles.centerBox}>Loading...</div>;
  if (!course) return <div style={styles.centerBox}>Kursus tidak ditemukan.</div>;

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* INJECT GOOGLE FONT POPPINS */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
          * { font-family: 'Poppins', sans-serif; }
        `}
      </style>

      {/* NAVIGASI ATAS */}
      <div style={styles.container}>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          <span style={{ marginRight: '8px', fontSize: '18px' }}>←</span> Kembali
        </button>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ ...styles.container, display: 'flex', flexDirection: 'row', gap: '50px', flexWrap: 'wrap' }}>
        
        {/* --- LEFT COLUMN (CONTENT) --- */}
        <div style={{ flex: '1.8', minWidth: '320px' }}>
            
            {/* Header / Judul */}
            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <span style={styles.badgeCategory}>{course.category}</span>
                </div>
                
                <h1 style={{ fontSize: '42px', fontWeight: '700', color: theme.textMain, marginBottom: '16px', lineHeight: '1.2', letterSpacing: '-1px' }}>
                    {course.title}
                </h1>
                <p style={{ fontSize: '16px', color: theme.textSec, lineHeight: '1.8', fontWeight: '400' }}>
                    {course.description}
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px', fontSize: '13px', color: theme.textSec }}>
                    <span>⭐ 4.8 (120 Ulasan)</span>
                    <span>•</span>
                    <span>👨‍🏫 Oleh Tim EduPlatform</span>
                </div>
            </div>

            {/* Accordion Syllabus */}
            <div>
                <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '24px', color: theme.textMain }}>
                    Materi Pembelajaran
                </h3>
                <div style={styles.syllabusCard}>
                    {modules.map((modul) => (
                        <div key={modul.id} style={styles.moduleItem}>
                            
                            {/* Module Header */}
                            <div 
                                onClick={() => toggleModule(modul.id)}
                                style={{ 
                                    padding: '24px', 
                                    backgroundColor: theme.white, 
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span style={{ fontSize: '18px', color: openModuleId === modul.id ? theme.primary : '#C4C4C4' }}>
                                        {openModuleId === modul.id ? '📂' : '📁'}
                                    </span>
                                    <span style={{ fontWeight: '600', fontSize: '16px', color: theme.textMain }}>
                                        {modul.title}
                                    </span>
                                </div>
                                <span style={{ color: '#C4C4C4', fontSize: '12px', transform: openModuleId === modul.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>
                                    ▼
                                </span>
                            </div>

                            {/* Module Content */}
                            {openModuleId === modul.id && (
                                <div style={{ backgroundColor: '#FAFAFA', borderTop: `1px solid ${theme.border}` }}>
                                    
                                    {/* List Pelajaran */}
                                    {modul.lessons.map(lesson => (
                                        <div 
                                            key={lesson.id}
                                            onClick={() => (checkAccess() || lesson.is_preview) ? navigate(`/lesson/${lesson.id}`) : alert("Materi terkunci")}
                                            style={styles.lessonRow}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={styles.playIconSmall}>▶</div>
                                                <span style={{ fontSize: '14px', fontWeight: '500', color: (checkAccess() || lesson.is_preview) ? theme.textMain : theme.textSec }}>
                                                    {lesson.title}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {lesson.is_preview && <span style={styles.previewBadge}>Preview</span>}
                                                {!checkAccess() && !lesson.is_preview && <span style={{fontSize: '14px'}}>🔒</span>}
                                            </div>
                                        </div>
                                    ))}

                                    {/* List Tugas */}
                                    {modul.assignments.map(assign => (
                                        <div 
                                            key={assign.id}
                                            onClick={() => checkAccess() ? navigate(`/assignment/${assign.id}`) : alert("Tugas terkunci")}
                                            style={{ ...styles.lessonRow, backgroundColor: '#FFFDF5' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{...styles.playIconSmall, backgroundColor: '#FFF7ED', color: '#D97706'}}>📝</div>
                                                <span style={{ fontSize: '14px', fontWeight: '500', color: theme.textMain }}>
                                                    {assign.title}
                                                </span>
                                            </div>
                                            {!checkAccess() && <span>🔒</span>}
                                        </div>
                                    ))}

                                    {modul.lessons.length === 0 && modul.assignments.length === 0 && (
                                        <div style={{ padding: '20px', textAlign: 'center', color: theme.textSec, fontSize: '13px', fontStyle: 'italic' }}>
                                            Materi belum ditambahkan.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* --- RIGHT COLUMN (STICKY SIDEBAR) --- */}
        <div style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
            <div style={styles.stickyCard}>
                
                {/* Image Section */}
                <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                    <img 
                        src={course.thumbnail_url || 'https://via.placeholder.com/600x400'} 
                        alt="Thumbnail" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                        onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseOut={e => e.target.style.transform = 'scale(1.0)'}
                    />
                    <div style={styles.gradientOverlay}></div>
                </div>

                {/* Content Section */}
                <div style={{ padding: '32px 28px' }}>
                    
                    {checkAccess() ? (
                        <div style={{ textAlign: 'center' }}>
                             <div style={{ width: '60px', height: '60px', backgroundColor: '#ECFDF5', color: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px auto' }}>
                                 ✅
                             </div>
                             <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Sudah Terdaftar</h4>
                             <p style={{ fontSize: '13px', color: theme.textSec, marginBottom: '24px' }}>Lanjutkan progres belajarmu sekarang.</p>
                             
                             <button 
                                onClick={() => {
                                    if(modules[0]?.lessons[0]) navigate(`/lesson/${modules[0].lessons[0].id}`);
                                    else alert("Materi belum tersedia");
                                }}
                                style={styles.btnPrimary}
                            >
                                Lanjut Belajar
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                                <div>
                                    <span style={{ fontSize: '13px', color: theme.textSec, display: 'block', marginBottom: '4px' }}>Harga Kursus</span>
                                    <span style={{ fontSize: '28px', fontWeight: '800', color: theme.textMain }}>
                                        {course.is_locked ? 'Premium' : 'Gratis'}
                                    </span>
                                </div>
                                {course.is_locked && <span style={styles.badgeLock}>🔒 Terkunci</span>}
                            </div>
                            
                            {course.is_locked && (
                                <div style={{ marginBottom: '20px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Masukkan Kunci Akses..."
                                        value={enrollKey}
                                        onChange={(e) => setEnrollKey(e.target.value)}
                                        style={styles.inputKey}
                                    />
                                </div>
                            )}

                            <button onClick={handleEnroll} style={styles.btnPrimary}>
                                {course.is_locked ? 'Buka Akses Sekarang' : 'Daftar Gratis'}
                            </button>

                            <p style={{ textAlign: 'center', fontSize: '12px', color: theme.textSec, marginTop: '16px' }}>
                                Garansi uang kembali 30 hari
                            </p>
                        </div>
                    )}

                    {/* Features List */}
                    <div style={{ marginTop: '30px', borderTop: `1px solid ${theme.border}`, paddingTop: '24px' }}>
                        <h5 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Benefit Kursus:</h5>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', color: theme.textSec, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li style={{display: 'flex', gap: '10px'}}>📱 <span>Akses penuh seumur hidup</span></li>
                            <li style={{display: 'flex', gap: '10px'}}>💻 <span>Akses di HP dan Desktop</span></li>
                            <li style={{display: 'flex', gap: '10px'}}>🏆 <span>Sertifikat kelulusan</span></li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

// --- STYLES WITH POPPINS OPTIMIZED ---
const styles = {
    container: {
        maxWidth: '1140px',
        margin: '0 auto',
        padding: '24px 24px',
    },
    centerBox: {
        minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDF8F4', fontSize: '16px', fontWeight: '500', color: '#555'
    },
    backButton: {
        background: 'none', border: 'none', color: '#757575', cursor: 'pointer', fontWeight: '500', marginBottom: '10px', fontSize: '14px', display: 'flex', alignItems: 'center', transition: '0.2s'
    },
    badgeCategory: {
        backgroundColor: '#FFF0E6', color: '#FF7E3E', padding: '8px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase'
    },
    badgeLock: {
        backgroundColor: '#FEF2F2', color: '#EF4444', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700'
    },
    syllabusCard: {
        borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #F0F0F0'
    },
    moduleItem: {
        borderBottom: '1px solid #F0F0F0'
    },
    lessonRow: {
        padding: '16px 24px 16px 50px', 
        borderBottom: '1px solid #F0F0F0', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        cursor: 'pointer', 
        transition: 'background 0.2s ease',
    },
    playIconSmall: {
        width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#E0E7FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0
    },
    previewBadge: {
        fontSize: '11px', backgroundColor: '#ECFDF5', color: '#059669', padding: '4px 8px', borderRadius: '6px', fontWeight: '600'
    },
    stickyCard: {
        position: 'sticky', top: '40px', 
        backgroundColor: '#FFFFFF', borderRadius: '24px', overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(255, 126, 62, 0.08)', border: '1px solid #F8F8F8'
    },
    gradientOverlay: {
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'linear-gradient(to bottom, transparent 70%, rgba(0,0,0,0.1) 100%)', pointerEvents: 'none'
    },
    inputKey: {
        width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #E5E7EB', outline: 'none', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#F9FAFB', fontWeight: '500', fontFamily: 'Poppins, sans-serif'
    },
    btnPrimary: {
        width: '100%', padding: '16px', backgroundColor: '#FF7E3E', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 25px rgba(255, 126, 62, 0.25)', transition: 'transform 0.2s ease, box-shadow 0.2s ease', fontFamily: 'Poppins, sans-serif'
    }
};

export default CourseDetailPage;