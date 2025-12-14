import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ManageCoursePage = () => {
  const { id } = useParams(); // ID Kursus
  const navigate = useNavigate();
  
  // State Data
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Editor
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // State Form Input (Untuk Module Baru & Lesson Baru)
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [activeModuleId, setActiveModuleId] = useState(null); // Untuk modal add lesson

  // --- 1. FETCH DATA ---
  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      // Ambil Info Kursus
      const courseRes = await api.get(`/courses/${id}`);
      setCourse(courseRes.data.course);

      // Ambil Modules
      const modulesRes = await api.get(`/courses/${id}/modules`);
      const modulesData = modulesRes.data.modules;

      // Ambil Lessons untuk setiap Module (Parallel Fetching)
      const modulesWithLessons = await Promise.all(modulesData.map(async (mod) => {
        const lessonsRes = await api.get(`/modules/${mod.id}/lessons`);
        return { ...mod, lessons: lessonsRes.data.lessons };
      }));

      setModules(modulesWithLessons);
    } catch (err) {
      console.error("Error loading course content:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. HANDLERS (CRUD) ---

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    try {
      await api.post(`/courses/${id}/modules`, { title: newModuleTitle, sort_order: modules.length });
      setNewModuleTitle('');
      fetchCourseData(); // Refresh data
    } catch (err) {
      alert('Gagal menambah modul');
    }
  };

  const handleAddLesson = async (moduleId) => {
    const title = prompt("Masukkan Judul Pelajaran Baru:");
    if (!title) return;

    try {
      await api.post(`/modules/${moduleId}/lessons`, { 
        title: title, 
        content_text: '', 
        video_url: '',
        sort_order: 0 // Logic sort order bisa diperbaiki nanti
      });
      fetchCourseData();
    } catch (err) {
      alert('Gagal menambah pelajaran');
    }
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/lessons/${selectedLesson.id}`, {
        title: selectedLesson.title,
        video_url: selectedLesson.video_url,
        content_text: selectedLesson.content_text,
        is_preview: selectedLesson.is_preview
      });
      alert('Perubahan berhasil disimpan!');
      fetchCourseData(); // Refresh agar sidebar juga update jika judul berubah
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan perubahan.');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm('Yakin ingin menghapus pelajaran ini?')) return;
    try {
      await api.delete(`/lessons/${lessonId}`);
      setSelectedLesson(null); // Clear editor
      fetchCourseData();
    } catch (err) {
      alert('Gagal menghapus pelajaran.');
    }
  };

  // --- 3. RENDER ---
  if (loading) return <div className="text-center p-5">Loading Editor...</div>;

  return (
    <div className="d-flex flex-column vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      
      {/* HEADER EDITOR */}
      <div className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center shadow-sm sticky-top" style={{ zIndex: 10 }}>
        <div className="d-flex align-items-center gap-3">
          <button onClick={() => navigate('/instructor-dashboard')} className="btn btn-outline-secondary btn-sm rounded-circle">
            <i className="bi bi-arrow-left"></i>
          </button>
          <div>
             <h5 className="mb-0 fw-bold text-dark">{course.title}</h5>
             <small className="text-muted">Mode Edit Konten</small>
          </div>
        </div>
        <button className="btn btn-primary btn-sm fw-bold px-3 rounded-pill">
          <i className="bi bi-eye me-2"></i>Preview Kursus
        </button>
      </div>

      <div className="flex-grow-1 overflow-hidden">
        <div className="row h-100 g-0">
          
          {/* KOLOM KIRI: SIDEBAR MODUL (Scrollable) */}
          <div className="col-md-4 col-lg-3 bg-white border-end h-100 overflow-auto">
            <div className="p-3">
              <h6 className="fw-bold text-muted text-uppercase small mb-3">Struktur Materi</h6>
              
              {/* List Modules */}
              <div className="accordion" id="accordionModules">
                {modules.map((mod, idx) => (
                  <div className="accordion-item border-0 mb-2 shadow-sm rounded overflow-hidden" key={mod.id}>
                    <h2 className="accordion-header">
                      <button 
                        className="accordion-button collapsed fw-bold bg-light text-dark py-2" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target={`#collapse${mod.id}`}
                      >
                        <span className="me-2 text-muted">{idx + 1}.</span> {mod.title}
                      </button>
                    </h2>
                    <div id={`collapse${mod.id}`} className="accordion-collapse collapse" data-bs-parent="#accordionModules">
                      <div className="accordion-body p-0">
                        <div className="list-group list-group-flush">
                          {mod.lessons.map((lesson) => (
                            <button
                              key={lesson.id}
                              onClick={() => setSelectedLesson(lesson)}
                              className={`list-group-item list-group-item-action border-0 py-2 small d-flex align-items-center justify-content-between px-4 ${selectedLesson?.id === lesson.id ? 'bg-primary bg-opacity-10 text-primary fw-bold' : 'text-muted'}`}
                            >
                              <div className="d-flex align-items-center gap-2">
                                <i className={`bi ${lesson.video_url ? 'bi-play-circle-fill' : 'bi-file-text'} small`}></i>
                                <span className="text-truncate" style={{ maxWidth: '150px' }}>{lesson.title}</span>
                              </div>
                              {selectedLesson?.id === lesson.id && <i className="bi bi-chevron-right small"></i>}
                            </button>
                          ))}
                          
                          {/* Tombol Add Lesson Kecil */}
                          <button 
                            onClick={() => handleAddLesson(mod.id)}
                            className="list-group-item list-group-item-action border-0 text-center text-primary small py-2 fw-bold bg-light"
                          >
                            <i className="bi bi-plus-circle me-1"></i> Tambah Pelajaran
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Add Module */}
              <form onSubmit={handleAddModule} className="mt-4 pt-3 border-top">
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control form-control-sm" 
                    placeholder="Judul Modul Baru..." 
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                  />
                  <button className="btn btn-dark btn-sm" type="submit">Tambah</button>
                </div>
              </form>

            </div>
          </div>

          {/* KOLOM KANAN: EDITOR AREA (Scrollable) */}
          <div className="col-md-8 col-lg-9 h-100 overflow-auto bg-light">
            {selectedLesson ? (
              <div className="p-4 p-lg-5" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold mb-0">Edit Pelajaran</h4>
                  <button 
                    onClick={() => handleDeleteLesson(selectedLesson.id)}
                    className="btn btn-outline-danger btn-sm"
                  >
                    <i className="bi bi-trash"></i> Hapus
                  </button>
                </div>

                <div className="card border-0 shadow-sm rounded-4">
                  <div className="card-body p-4">
                    <form onSubmit={handleUpdateLesson}>
                      
                      {/* Judul */}
                      <div className="mb-3">
                        <label className="form-label fw-bold text-muted small">JUDUL PELAJARAN</label>
                        <input 
                          type="text" 
                          className="form-control form-control-lg fw-bold" 
                          value={selectedLesson.title}
                          onChange={(e) => setSelectedLesson({...selectedLesson, title: e.target.value})}
                        />
                      </div>

                      {/* Video URL */}
                      <div className="mb-3">
                        <label className="form-label fw-bold text-muted small">VIDEO URL / EMBED LINK</label>
                        <div className="input-group">
                           <span className="input-group-text bg-white border-end-0"><i className="bi bi-link-45deg"></i></span>
                           <input 
                             type="text" 
                             className="form-control border-start-0 ps-0" 
                             placeholder="https://..."
                             value={selectedLesson.video_url || ''}
                             onChange={(e) => setSelectedLesson({...selectedLesson, video_url: e.target.value})}
                           />
                        </div>
                        <div className="form-text text-muted small">Mendukung link YouTube, Vimeo, atau link file langsung.</div>
                      </div>

                      {/* Preview Video Box */}
                      {selectedLesson.video_url && (
                          <div className="ratio ratio-16x9 mb-4 bg-dark rounded overflow-hidden">
                             {/* iframe sederhana untuk preview */}
                             <iframe src={selectedLesson.video_url.replace('watch?v=', 'embed/')} title="Video Preview" allowFullScreen></iframe>
                          </div>
                      )}

                      {/* Konten Text */}
                      <div className="mb-4">
                        <label className="form-label fw-bold text-muted small">DESKRIPSI & MATERI TEKS</label>
                        <textarea 
                          className="form-control" 
                          rows="8" 
                          placeholder="Tuliskan materi pelajaran di sini..."
                          value={selectedLesson.content_text || ''}
                          onChange={(e) => setSelectedLesson({...selectedLesson, content_text: e.target.value})}
                          style={{ resize: 'none' }}
                        ></textarea>
                      </div>

                      {/* Checkbox Preview */}
                      <div className="form-check mb-4">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="checkPreview"
                          checked={selectedLesson.is_preview || false}
                          onChange={(e) => setSelectedLesson({...selectedLesson, is_preview: e.target.checked})}
                        />
                        <label className="form-check-label text-dark" htmlFor="checkPreview">
                          Jadikan sebagai <strong>Pratinjau Gratis</strong> (Bisa diakses tanpa mendaftar)
                        </label>
                      </div>

                      <div className="d-grid">
                        <button type="submit" className="btn btn-primary fw-bold py-2">
                          <i className="bi bi-save me-2"></i> Simpan Perubahan
                        </button>
                      </div>

                    </form>
                  </div>
                </div>
              </div>
            ) : (
              // Empty State (Belum ada pelajaran dipilih)
              <div className="h-100 d-flex flex-column justify-content-center align-items-center text-muted p-5">
                <div className="bg-white p-4 rounded-circle shadow-sm mb-3">
                  <i className="bi bi-pencil-square fs-1 text-primary opacity-50"></i>
                </div>
                <h4 className="fw-bold text-dark">Editor Konten</h4>
                <p className="text-center" style={{ maxWidth: '400px' }}>
                  Pilih salah satu pelajaran dari sidebar kiri untuk mulai mengedit, atau buat modul baru jika belum ada.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManageCoursePage;