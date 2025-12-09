import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const LessonPage = () => {
  const { id } = useParams(); // Ambil ID lesson
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await api.get(`/lessons/${id}`);
        setLesson(response.data.lesson);
      } catch (err) {
        console.error("Gagal load lesson:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [id]);

  const handleComplete = async () => {
    if (!user) return;
    try {
      await api.post(`/lessons/${id}/complete`, {
        student_id: user.id
      });
      alert("Selamat! Materi selesai.");
      // Bisa tambahkan logika navigasi ke materi selanjutnya di sini
    } catch (err) {
      console.error(err);
    }
  };

  // Helper: Ubah link Youtube biasa jadi Embed
  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  if (loading) return <p style={{textAlign:'center', marginTop: '50px'}}>Memuat materi...</p>;
  if (!lesson) return <p style={{textAlign:'center', marginTop: '50px'}}>Materi tidak ditemukan.</p>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      
      {/* Tombol Kembali */}
      <button 
        onClick={() => navigate(-1)} 
        style={{ marginBottom: '20px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1rem' }}
      >
        ← Kembali ke Silabus
      </button>

      {/* Judul */}
      <h1 style={{ color: '#333' }}>{lesson.title}</h1>

      {/* Video Player */}
      {lesson.video_url && (
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', marginBottom: '30px', backgroundColor: '#000' }}>
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

      {/* Konten Teks */}
      <div style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#444', marginBottom: '40px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        {lesson.content_text ? (
          lesson.content_text.split('\n').map((par, idx) => (
            <p key={idx}>{par}</p>
          ))
        ) : (
          <p>Tidak ada konten teks.</p>
        )}
      </div>

      {/* Tombol Selesai */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <button 
          onClick={handleComplete}
          style={{ 
            padding: '15px 40px', 
            fontSize: '1.2rem', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '50px', 
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          ✅ Tandai Selesai
        </button>
      </div>

    </div>
  );
};

export default LessonPage;