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

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Ambil Detail Course (sekarang response ada 'is_locked')
        const courseRes = await api.get(`/courses/${id}`);
        setCourse(courseRes.data.course);

        // 2. Ambil Daftar Modul
        const modulesRes = await api.get(`/courses/${id}/modules`);
        const modulesData = modulesRes.data.modules;

        const detailedModules = await Promise.all(
          modulesData.map(async (mod) => {
             try {
               const lessonsRes = await api.get(`/modules/${mod.id}/lessons`);
               const assignsRes = await api.get(`/modules/${mod.id}/assignments`);
               return { ...mod, lessons: lessonsRes.data.lessons, assignments: assignsRes.data.assignments || [] };
             } catch (err) {
               return { ...mod, lessons: [], assignments: [] };
             }
          })
        );
        
        setModules(detailedModules);

        // 3. Cek status enroll
        if (user) {
            try {
                const myCoursesRes = await api.get(`/students/${user.id}/courses`);
                const isEnrolled = myCoursesRes.data.courses.some(c => c.id == id);
                if (isEnrolled) setEnrollStatus('success');
            } catch (err) { console.error(err); }
        }

      } catch (err) {
        console.error("Gagal mengambil data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user?.id]);

  const handleEnroll = async () => {
    if (!user) {
      alert("Silakan Login dulu!");
      navigate('/login');
      return;
    }

    let key = null;
    
    // [LOGIKA BARU] Cek apakah kursus terkunci
    if (course.is_locked) {
        key = prompt("🔒 Kursus ini terkunci. Masukkan Enrollment Key:");
        if (!key) return; // Batal jika user cancel
    }

    try {
      await api.post('/enroll', {
        student_id: user.id,
        course_id: id,
        enrollment_key: key // Kirim key ke backend
      });
      setEnrollStatus('success');
      alert("Berhasil Mendaftar! Selamat belajar.");
    } catch (err) {
      const msg = err.response?.data?.error || "Gagal mendaftar";
      if (msg === 'Already enrolled') {
          setEnrollStatus('success');
      } else {
          // Tampilkan pesan spesifik (misal: Invalid Key)
          setEnrollStatus(msg);
          alert("Gagal: " + msg);
      }
    }
  };

  const checkAccess = () => {
      return enrollStatus === 'success' || enrollStatus === 'Already enrolled';
  };

  const handleLessonNavigation = (lesson) => {
    if (checkAccess() || lesson.is_preview) {
      navigate(`/lesson/${lesson.id}`);
    } else {
      alert("Materi terkunci. Silakan daftar dulu.");
    }
  };

  const handleAssignmentNavigation = (assign) => {
    if (checkAccess()) navigate(`/assignment/${assign.id}`);
    else alert("Tugas terkunci. Silakan daftar dulu.");
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>;
  if (!course) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Kursus tidak ditemukan.</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
        <img 
          src={course.thumbnail_url || 'https://via.placeholder.com/800x300'} 
          alt={course.title}
          style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px' }}
        />
        <h1 style={{ color: '#bc2131', marginBottom: '10px' }}>{course.title}</h1>
        <p style={{ fontSize: '1.1rem', color: '#555' }}>{course.description}</p>
        
        {/* Info Tambahan */}
        <div style={{ marginBottom: '15px' }}>
            <span style={{ marginRight: '15px' }}>🏷️ <strong>{course.category}</strong></span>
            {course.is_locked && (
                <span style={{ color: '#d9534f' }}>🔒 <strong>Butuh Enrollment Key</strong></span>
            )}
        </div>

        {checkAccess() ? (
          <button disabled style={{ padding: '10px 20px', backgroundColor: '#ccc', color: '#666', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
            ✅ Anda Sudah Terdaftar
          </button>
        ) : (
          <button 
            onClick={handleEnroll}
            style={{ padding: '12px 25px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
          >
            {course.is_locked ? 'Masukkan Kunci & Daftar' : 'Daftar Kelas Ini (Enroll)'}
          </button>
        )}
      </div>

      {/* SILABUS */}
      <div>
        <h3>Materi Pembelajaran</h3>
        {modules.map((modul) => (
          <div key={modul.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', marginBottom: '15px' }}>
            <div style={{ backgroundColor: '#f8f9fa', padding: '15px', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>
              {modul.title}
            </div>
            <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
              {modul.lessons && modul.lessons.map((lesson) => (
                <li 
                  key={'lesson-' + lesson.id} 
                  onClick={() => handleLessonNavigation(lesson)}
                  style={{ padding: '12px 15px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: 'white' }}
                >
                  <span style={{ color: '#bc2131' }}>▶</span> 
                  <span style={{ flex: 1 }}>{lesson.title}</span>
                  {lesson.is_preview && <span style={{ fontSize: '0.8rem', backgroundColor: '#e2e6ea', padding: '2px 6px', borderRadius: '4px' }}>Preview</span>}
                  {!checkAccess() && !lesson.is_preview && <span style={{ fontSize: '0.8rem', color: '#999' }}>🔒</span>}
                </li>
              ))}
              {modul.assignments && modul.assignments.map((assign) => (
                <li 
                  key={'assign-' + assign.id}
                  onClick={() => handleAssignmentNavigation(assign)}
                  style={{ padding: '12px 15px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', backgroundColor: '#fff5f5' }}
                >
                  <span style={{ color: '#d9534f' }}>📝</span> 
                  <span style={{ flex: 1, color: '#d9534f', fontWeight: '500' }}>Tugas: {assign.title}</span>
                  {!checkAccess() && <span style={{ fontSize: '0.8rem', color: '#999' }}>🔒</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseDetailPage;