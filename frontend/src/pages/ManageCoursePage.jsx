import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ManageCoursePage = () => {
  const { id } = useParams(); // ID Kursus
  const navigate = useNavigate();
  
  // --- STATE DATA ---
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE EDITOR (SELECTION) ---
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // --- STATE FORM ---
  const [newModuleTitle, setNewModuleTitle] = useState('');
  
  // State File Upload
  const [assignmentFile, setAssignmentFile] = useState(null); // Untuk Tugas
  const [lessonFile, setLessonFile] = useState(null);         // Untuk Materi

  // 1. FETCH DATA (Termasuk Assignments)
  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      // a. Ambil Info Kursus
      const courseRes = await api.get(`/courses/${id}`);
      setCourse(courseRes.data.course);

      // b. Ambil Modules
      const modulesRes = await api.get(`/courses/${id}/modules`);
      const modulesData = modulesRes.data.modules;

      // c. Ambil Lessons DAN Assignments untuk setiap Module
      const modulesWithContent = await Promise.all(modulesData.map(async (mod) => {
        const [lessonsRes, assignsRes] = await Promise.all([
            api.get(`/modules/${mod.id}/lessons`),
            api.get(`/modules/${mod.id}/assignments`)
        ]);

        return { 
            ...mod, 
            lessons: lessonsRes.data.lessons,
            assignments: assignsRes.data.assignments
        };
      }));

      setModules(modulesWithContent);
    } catch (err) {
      console.error("Error loading course content:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. HANDLERS: SELECTION LOGIC ---
  const selectLesson = (lesson) => {
      setSelectedLesson(lesson);
      setSelectedAssignment(null);
      setAssignmentFile(null); 
      setLessonFile(null); // Reset file materi
  };

  const selectAssignment = (assignment) => {
      setSelectedAssignment(assignment);
      setSelectedLesson(null);
      setAssignmentFile(null);
      setLessonFile(null);
  };

  // --- 3. HANDLERS: CRUD MODULE ---
  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    try {
      await api.post(`/courses/${id}/modules`, { title: newModuleTitle, sort_order: modules.length });
      setNewModuleTitle('');
      fetchCourseData();
    } catch (err) {
      alert('Gagal menambah modul');
    }
  };

  // --- 4. HANDLERS: CRUD LESSON ---
  const handleAddLesson = async (moduleId) => {
    const title = prompt("Masukkan Judul Pelajaran Baru:");
    if (!title) return;
    try {
      // Create awal (masih kosong)
      await api.post(`/modules/${moduleId}/lessons`, { 
        title: title, content_text: '', video_url: '', sort_order: 0 
      });
      fetchCourseData();
    } catch (err) {
      alert('Gagal menambah pelajaran');
    }
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', selectedLesson.title);
      formData.append('content_text', selectedLesson.content_text || '');
      formData.append('video_url', selectedLesson.video_url || ''); // URL lama/manual
      formData.append('is_preview', selectedLesson.is_preview);

      // Jika ada file baru diupload
      if (lessonFile) {
          formData.append('file_material', lessonFile);
      }

      // Backend support PUT multipart
      await api.put(`/lessons/${selectedLesson.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Pelajaran berhasil diupdate!');
      setLessonFile(null);
      fetchCourseData();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan perubahan.');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm('Hapus pelajaran ini?')) return;
    try {
      await api.delete(`/lessons/${lessonId}`);
      setSelectedLesson(null);
      fetchCourseData();
    } catch (err) {
      alert('Gagal menghapus.');
    }
  };

  // --- 5. HANDLERS: CRUD ASSIGNMENT ---
  const handleAddAssignment = async (moduleId) => {
    const title = prompt("Masukkan Judul Tugas Baru:");
    if (!title) return;
    try {
        await api.post(`/modules/${moduleId}/assignments`, {
            title: title,
            description: '',
            due_date: null
        });
        fetchCourseData();
    } catch (err) {
        console.error(err);
        alert('Gagal membuat tugas.');
    }
  };

  const handleUpdateAssignment = async (e) => {
      e.preventDefault();
      try {
          const formData = new FormData();
          formData.append('title', selectedAssignment.title);
          formData.append('description', selectedAssignment.description || '');
          formData.append('link_url', selectedAssignment.link_url || '');
          
          if (selectedAssignment.due_date) {
             formData.append('due_date', selectedAssignment.due_date);
          }

          if (assignmentFile) {
              formData.append('attachment_file', assignmentFile);
          }

          await api.post(`/assignments/${selectedAssignment.id}`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          
          alert('Tugas berhasil diupdate!');
          setAssignmentFile(null);
          fetchCourseData();
      } catch (err) {
          console.error(err);
          alert('Gagal update tugas.');
      }
  };

  const handleDeleteAssignment = async (assignId) => {
      if(!confirm('Hapus tugas ini? Data pengumpulan siswa juga akan terhapus.')) return;
      try {
          await api.delete(`/assignments/${assignId}`);
          setSelectedAssignment(null);
          fetchCourseData();
      } catch (err) {
          alert('Gagal menghapus tugas.');
      }
  };

  const formatDateTimeForInput = (isoString) => {
      if (!isoString) return '';
      return new Date(isoString).toISOString().slice(0, 16);
  };

  if (loading) return <div className="text-center p-5 text-muted">Memuat Editor...</div>;

  return (
    <div className="d-flex flex-column vh-100" style={{ backgroundColor: '#f5f5f7' }}>
      
      {/* HEADER */}
      <div className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center shadow-sm sticky-top" style={{ zIndex: 10 }}>
        <div className="d-flex align-items-center gap-3">
          <button onClick={() => navigate('/instructor-dashboard')} className="btn btn-light btn-sm rounded-circle border">
            <i className="bi bi-arrow-left"></i>
          </button>
          <div>
             <h5 className="mb-0 fw-bold text-dark" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'}}>{course.title}</h5>
             <small className="text-muted">Content Manager</small>
          </div>
        </div>
        
        {/* TOMBOL PREVIEW (SUDAH DIPERBAIKI) */}
        <button 
            onClick={() => navigate(`/course/${id}`)} 
            className="btn btn-dark btn-sm fw-bold px-3 rounded-pill"
        >
          <i className="bi bi-eye me-2"></i>Preview
        </button>
      </div>

      <div className="flex-grow-1 overflow-hidden">
        <div className="row h-100 g-0">
          
          {/* --- SIDEBAR --- */}
          <div className="col-md-4 col-lg-3 bg-white border-end h-100 overflow-auto">
            <div className="p-3">
              <h6 className="fw-bold text-secondary text-uppercase small mb-3 ls-1">Daftar Modul</h6>
              
              <div className="accordion" id="accordionModules">
                {modules.map((mod, idx) => (
                  <div className="accordion-item border-0 mb-3 shadow-sm rounded-3 overflow-hidden" key={mod.id}>
                    <h2 className="accordion-header">
                      <button 
                        className="accordion-button fw-bold text-dark py-3" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target={`#collapse${mod.id}`}
                        style={{backgroundColor: '#f8f9fa'}}
                      >
                        <span className="me-2 text-muted fw-normal">{idx + 1}.</span> {mod.title}
                      </button>
                    </h2>
                    <div id={`collapse${mod.id}`} className="accordion-collapse collapse show" data-bs-parent="#accordionModules">
                      <div className="accordion-body p-0">
                        <div className="list-group list-group-flush">
                          
                          {/* LESSONS */}
                          {mod.lessons.map((lesson) => (
                            <button
                              key={`lesson-${lesson.id}`}
                              onClick={() => selectLesson(lesson)}
                              className={`list-group-item list-group-item-action border-0 py-2 small d-flex align-items-center gap-2 px-4 ${selectedLesson?.id === lesson.id ? 'bg-primary text-white' : 'text-secondary'}`}
                            >
                              <i className={`bi ${lesson.video_url ? 'bi-play-circle' : 'bi-file-text'} fs-6`}></i>
                              <span className="text-truncate">{lesson.title}</span>
                            </button>
                          ))}

                          {/* ASSIGNMENTS */}
                          {mod.assignments && mod.assignments.map((assign) => (
                             <button
                                key={`assign-${assign.id}`}
                                onClick={() => selectAssignment(assign)}
                                className={`list-group-item list-group-item-action border-0 py-2 small d-flex align-items-center gap-2 px-4 ${selectedAssignment?.id === assign.id ? 'bg-danger text-white' : 'text-danger'}`}
                                style={{ backgroundColor: selectedAssignment?.id === assign.id ? '' : '#fff5f5' }}
                             >
                                <i className="bi bi-pencil-square fs-6"></i>
                                <span className="text-truncate">{assign.title}</span>
                                <span className="badge bg-danger ms-auto" style={{fontSize: '0.6rem'}}>Tugas</span>
                             </button>
                          ))}
                          
                          {/* BUTTONS ADD */}
                          <div className="d-flex border-top">
                              <button onClick={() => handleAddLesson(mod.id)} className="btn btn-link text-decoration-none text-primary small fw-bold flex-fill py-2">
                                + Materi
                              </button>
                              <div className="border-end"></div>
                              <button onClick={() => handleAddAssignment(mod.id)} className="btn btn-link text-decoration-none text-danger small fw-bold flex-fill py-2">
                                + Tugas
                              </button>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Add Module */}
              <form onSubmit={handleAddModule} className="mt-4">
                <div className="input-group input-group-sm">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Nama Modul Baru..." 
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                  />
                  <button className="btn btn-dark" type="submit">Tambah</button>
                </div>
              </form>

            </div>
          </div>

          {/* --- EDITOR AREA --- */}
          <div className="col-md-8 col-lg-9 h-100 overflow-auto">
            
            {/* 1. EDITOR PELAJARAN (LESSON) */}
            {selectedLesson && (
              <div className="p-4 p-lg-5 mx-auto fade-in-up" style={{ maxWidth: '900px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold mb-0 text-dark">Edit Pelajaran</h4>
                  <button onClick={() => handleDeleteLesson(selectedLesson.id)} className="btn btn-outline-danger btn-sm rounded-pill px-3">
                    <i className="bi bi-trash me-1"></i> Hapus
                  </button>
                </div>
                
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                    <div className="card-body p-4 p-lg-5 bg-white">
                        <form onSubmit={handleUpdateLesson}>
                            {/* Judul */}
                            <div className="mb-4">
                                <label className="text-uppercase text-muted fw-bold small mb-1">Judul Materi</label>
                                <input type="text" className="form-control form-control-lg fw-bold border-0 bg-light rounded-3 px-3" 
                                    value={selectedLesson.title}
                                    onChange={(e) => setSelectedLesson({...selectedLesson, title: e.target.value})}
                                />
                            </div>

                            {/* UPLOAD FILE (BARU) */}
                            <div className="mb-4">
                                <label className="text-uppercase text-muted fw-bold small mb-1">Upload Video / PDF / Gambar</label>
                                <input 
                                  type="file" 
                                  className="form-control"
                                  onChange={(e) => setLessonFile(e.target.files[0])}
                                  accept="video/*,image/*,.pdf,.doc,.docx,.ppt,.pptx"
                                />
                                <div className="form-text small">
                                    File yang diupload akan menggantikan Video URL secara otomatis.
                                </div>
                            </div>

                            {/* Video URL (Manual) */}
                            <div className="mb-4">
                                <label className="text-uppercase text-muted fw-bold small mb-1">Atau Masukkan Link URL (Youtube/External)</label>
                                <input type="text" className="form-control bg-light border-0 rounded-3 px-3" placeholder="https://youtube.com/..."
                                    value={selectedLesson.video_url || ''}
                                    onChange={(e) => setSelectedLesson({...selectedLesson, video_url: e.target.value})}
                                />
                            </div>

                            {/* Preview File/Video */}
                            {selectedLesson.video_url && (
                                <div className="ratio ratio-16x9 mb-4 rounded-3 overflow-hidden bg-dark">
                                    {/* Jika Youtube/Embeddable */}
                                    <iframe src={selectedLesson.video_url.replace('watch?v=', 'embed/')} title="Preview"></iframe>
                                </div>
                            )}

                            {/* Deskripsi */}
                            <div className="mb-4">
                                <label className="text-uppercase text-muted fw-bold small mb-1">Isi Materi / Deskripsi</label>
                                <textarea className="form-control bg-light border-0 rounded-3 px-3 py-3" rows="10"
                                    value={selectedLesson.content_text || ''}
                                    onChange={(e) => setSelectedLesson({...selectedLesson, content_text: e.target.value})}
                                ></textarea>
                            </div>

                            <div className="form-check form-switch mb-4">
                                <input className="form-check-input" type="checkbox" id="previewSwitch" 
                                    checked={selectedLesson.is_preview || false}
                                    onChange={(e) => setSelectedLesson({...selectedLesson, is_preview: e.target.checked})}
                                />
                                <label className="form-check-label" htmlFor="previewSwitch">Jadikan Pratinjau Gratis (Public)</label>
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg w-100 rounded-pill fw-bold shadow-sm">Simpan Perubahan</button>
                        </form>
                    </div>
                </div>
              </div>
            )}

            {/* 2. EDITOR TUGAS (ASSIGNMENT) */}
            {selectedAssignment && (
              <div className="p-4 p-lg-5 mx-auto fade-in-up" style={{ maxWidth: '900px' }}>
                 <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold mb-0 text-danger">Edit Tugas</h4>
                  <div className="d-flex gap-2">
                      <button 
                        onClick={() => navigate(`/grading/${selectedAssignment.id}`)}
                        className="btn btn-success btn-sm rounded-pill px-3 fw-bold"
                      >
                        <i className="bi bi-clipboard-check me-2"></i>Nilai Submission
                      </button>
                      <button onClick={() => handleDeleteAssignment(selectedAssignment.id)} className="btn btn-outline-danger btn-sm rounded-pill px-3">
                        <i className="bi bi-trash me-1"></i> Hapus
                      </button>
                  </div>
                </div>

                <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                    <div className="card-body p-4 p-lg-5 bg-white">
                        <form onSubmit={handleUpdateAssignment}>
                             <div className="mb-4">
                                <label className="text-uppercase text-muted fw-bold small mb-1">Judul Tugas</label>
                                <input type="text" className="form-control form-control-lg fw-bold border-0 bg-danger bg-opacity-10 text-danger rounded-3 px-3" 
                                    value={selectedAssignment.title}
                                    onChange={(e) => setSelectedAssignment({...selectedAssignment, title: e.target.value})}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="text-uppercase text-muted fw-bold small mb-1">Tenggat Waktu (Deadline)</label>
                                <div className="d-flex align-items-center gap-2">
                                    <input 
                                        type="datetime-local" 
                                        className="form-control bg-light border-0 rounded-3 px-3"
                                        style={{maxWidth: '300px'}}
                                        value={formatDateTimeForInput(selectedAssignment.due_date)}
                                        onChange={(e) => setSelectedAssignment({...selectedAssignment, due_date: e.target.value})}
                                    />
                                    <span className="text-muted small">Kosongkan jika tidak ada deadline.</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="text-uppercase text-muted fw-bold small mb-1">Instruksi Tugas</label>
                                <textarea className="form-control bg-light border-0 rounded-3 px-3 py-3" rows="6"
                                    placeholder="Jelaskan apa yang harus dikerjakan siswa..."
                                    value={selectedAssignment.description || ''}
                                    onChange={(e) => setSelectedAssignment({...selectedAssignment, description: e.target.value})}
                                ></textarea>
                            </div>

                            <hr className="my-4"/>

                            <div className="mb-4">
                                <label className="text-uppercase text-muted fw-bold small mb-1">Lampirkan File (PDF/Word/Gambar)</label>
                                <input 
                                    type="file" 
                                    className="form-control"
                                    onChange={(e) => setAssignmentFile(e.target.files[0])}
                                />
                                {selectedAssignment.attachment_url && (
                                    <div className="mt-2 small">
                                        File saat ini: <a href={selectedAssignment.attachment_url} target="_blank" rel="noreferrer" className="text-danger fw-bold">Lihat File</a>
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="text-uppercase text-muted fw-bold small mb-1">Link Referensi (Optional)</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0"><i className="bi bi-link-45deg"></i></span>
                                    <input 
                                        type="text" 
                                        className="form-control border-start-0 ps-0"
                                        placeholder="https://..."
                                        value={selectedAssignment.link_url || ''}
                                        onChange={(e) => setSelectedAssignment({...selectedAssignment, link_url: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-danger btn-lg w-100 rounded-pill fw-bold shadow-sm mt-3">
                                Simpan Tugas
                            </button>
                        </form>
                    </div>
                </div>
              </div>
            )}

            {/* 3. EMPTY STATE */}
            {!selectedLesson && !selectedAssignment && (
               <div className="h-100 d-flex flex-column justify-content-center align-items-center text-muted p-5">
                <div className="bg-white p-4 rounded-circle shadow-sm mb-3">
                  <i className="bi bi-pencil-fill fs-1 text-secondary opacity-50"></i>
                </div>
                <h4 className="fw-bold text-dark">Editor Konten</h4>
                <p className="text-center" style={{ maxWidth: '400px' }}>
                  Pilih Pelajaran atau Tugas dari menu di samping untuk mulai mengedit.
                </p>
              </div>
            )}

          </div>

        </div>
      </div>
      
      <style>
        {`
          .fade-in-up { animation: fadeInUp 0.4s ease-out; }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default ManageCoursePage;