import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const LessonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/lessons/${id}`);
        setLesson(res.data.lesson);
      } catch (err) {
        console.error("Gagal load lesson:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessonData();
  }, [id]);

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

  if (loading) return <div className="text-center p-5 text-muted">Memuat materi...</div>;
  if (!lesson) return <div className="text-center p-5 text-danger">Materi tidak ditemukan.</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-link text-decoration-none text-secondary ps-0 mb-3 fw-bold"
        style={{ fontSize: '0.9rem' }}
      >
        <i className="bi bi-arrow-left me-1"></i> Kembali ke Materi
      </button>

      <h1 className="fw-bold text-dark mb-4" style={{ fontSize: '1.8rem' }}>{lesson.title}</h1>
      
      {/* RENDER VIEWER */}
      {renderContent(lesson.video_url)}

      <div className="bg-white p-4 rounded-3 shadow-sm border mb-5">
        <h6 className="fw-bold text-muted text-uppercase small mb-3">Deskripsi Materi</h6>
        <div style={{ lineHeight: '1.8', fontSize: '1rem', color: '#333' }}>
            {lesson.content_text ? (
            lesson.content_text.split('\n').map((par, idx) => (
                <p key={idx} className="mb-3">{par}</p>
            ))
            ) : (
            <p className="text-muted fst-italic">Tidak ada deskripsi tambahan.</p>
            )}
        </div>
      </div>

      <div className="text-center pb-5">
        <button 
          onClick={handleComplete}
          disabled={isCompleted}
          className={`btn btn-lg rounded-pill px-5 fw-bold shadow-sm ${isCompleted ? 'btn-success' : 'btn-primary'}`}
          style={{ transition: 'all 0.3s' }}
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