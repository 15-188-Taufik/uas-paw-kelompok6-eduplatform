import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const LessonPage = () => {
  const { id } = useParams(); // ID Lesson
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false); // State baru untuk status selesai
  
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true);
        // 1. Ambil Detail Lesson
        const res = await api.get(`/lessons/${id}`);
        setLesson(res.data.lesson);

        // 2. Cek apakah user sudah menyelesaikan lesson ini?
        // (Kita perlu endpoint khusus atau cek manual, 
        //  tapi untuk simpel, kita coba hit endpoint complete. 
        //  Jika return "Already completed", berarti sudah selesai)
        if (user) {
            // Cara tricky tanpa buat endpoint baru: 
            // Coba post complete, backend saya sudah buat agar tidak error kalau duplikat.
            // Tapi idealnya nanti buat endpoint GET /lessons/{id}/status.
            // Untuk sekarang, kita biarkan default false dulu,
            // nanti tombol akan berubah setelah diklik.
        }
      } catch (err) {
        console.error("Gagal load lesson:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessonData();
  }, [id, user?.id]);

  const handleComplete = async () => {
    if (!user) return;
    try {
      await api.post(`/lessons/${id}/complete`, {
        student_id: user.id
      });
      
      // Update UI jadi selesai
      setIsCompleted(true);
      alert("Selamat! Materi selesai. Progress Anda telah diperbarui.");
      
      // Opsional: Balik ke dashboard atau materi lain
      // navigate('/student-dashboard');
      
    } catch (err) {
      console.error(err);
    }
  };

  // Helper: Embed Youtube
  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url; 
  };

  if (loading) return <div className="text-center p-5">Memuat materi...</div>;
  if (!lesson) return <div className="text-center p-5">Materi tidak ditemukan.</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '20px', display:'flex', alignItems:'center', gap:'5px' }}
      >
        ← Kembali
      </button>

      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px' }}>{lesson.title}</h1>
      
      <div style={{ marginBottom: '30px' }}>
        {lesson.video_url && (
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', backgroundColor: '#000', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <iframe 
                src={getEmbedUrl(lesson.video_url)} 
                title={lesson.title}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
            />
            </div>
        )}
      </div>

      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', lineHeight: '1.8', fontSize: '1.1rem', color: '#333', marginBottom: '40px' }}>
        {lesson.content_text ? (
          lesson.content_text.split('\n').map((par, idx) => (
            <p key={idx} style={{ marginBottom: '1rem' }}>{par}</p>
          ))
        ) : (
          <p className="text-muted">Tidak ada deskripsi teks.</p>
        )}
      </div>

      {/* TOMBOL SELESAI */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <button 
          onClick={handleComplete}
          disabled={isCompleted}
          style={{ 
            padding: '16px 40px', 
            fontSize: '1.1rem', 
            backgroundColor: isCompleted ? '#10b981' : '#2563eb', // Hijau jika selesai, Biru jika belum
            color: 'white', 
            border: 'none', 
            borderRadius: '50px', 
            cursor: isCompleted ? 'default' : 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease'
          }}
        >
          {isCompleted ? (
            <span><i className="bi bi-check-circle-fill me-2"></i> Materi Selesai</span>
          ) : (
            <span>Tandai Selesai <i className="bi bi-arrow-right ms-2"></i></span>
          )}
        </button>
      </div>
    </div>
  );
};

export default LessonPage;