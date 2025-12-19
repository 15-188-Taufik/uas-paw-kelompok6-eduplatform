import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../api/axios';

const ManageCoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [newModuleTitle, setNewModuleTitle] = useState('');
  
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [lessonFile, setLessonFile] = useState(null);

  // --- THEME ---
  const theme = {
    primary: '#FF7E3E',
    primaryLight: '#FFF5F1',
    bg: '#FDF8F4',
    textMain: '#2D2D2D',
    danger: '#FF4D4F'
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      // [PERBAIKAN] Tambah /api
      const courseRes = await api.get(`/api/courses/${id}`);
      setCourse(courseRes.data.course);

      // [PERBAIKAN] Tambah /api
      const modulesRes = await api.get(`/api/courses/${id}/modules`);
      const modulesData = modulesRes.data.modules;

      const modulesWithContent = await Promise.all(modulesData.map(async (mod) => {
        const [lessonsRes, assignsRes] = await Promise.all([
            // [PERBAIKAN] Tambah /api
            api.get(`/api/modules/${mod.id}/lessons`),
            api.get(`/api/modules/${mod.id}/assignments`)
        ]);

        return { 
            ...mod, 
            lessons: lessonsRes.data.lessons,
            assignments: assignsRes.data.assignments
        };
      }));

      setModules(modulesWithContent);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- SELECTION LOGIC ---
  const selectLesson = (lesson) => {
      setSelectedLesson(lesson);
      setSelectedAssignment(null);
      setAssignmentFile(null); 
      setLessonFile(null);
  };

  const selectAssignment = (assignment) => {
      setSelectedAssignment(assignment);
      setSelectedLesson(null);
      setAssignmentFile(null);
      setLessonFile(null);
  };

  // --- HANDLERS (With SweetAlert) ---
  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    try {
      // [PERBAIKAN] Tambah /api
      await api.post(`/api/courses/${id}/modules`, { title: newModuleTitle, sort_order: modules.length });
      setNewModuleTitle('');
      fetchCourseData();
      const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      Toast.fire({ icon: 'success', title: 'Modul ditambahkan' });
    } catch (err) {
      Swal.fire('Gagal', 'Tidak bisa menambah modul', 'error');
    }
  };

  const handleAddLesson = async (moduleId) => {
    const { value: title } = await Swal.fire({
      title: 'Judul Pelajaran Baru',
      input: 'text',
      showCancelButton: true,
      confirmButtonColor: theme.primary,
      inputPlaceholder: 'Masukkan judul...'
    });

    if (title) {
        try {
            // [PERBAIKAN] Tambah /api
            await api.post(`/api/modules/${moduleId}/lessons`, { title: title, content_text: '', video_url: '', sort_order: 0 });
            fetchCourseData();
        } catch (err) {
            Swal.fire('Error', 'Gagal membuat pelajaran', 'error');
        }
    }
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', selectedLesson.title);
      formData.append('content_text', selectedLesson.content_text || '');
      formData.append('video_url', selectedLesson.video_url || '');
      formData.append('is_preview', selectedLesson.is_preview);
      if (lessonFile) formData.append('file_material', lessonFile);

      // [PERBAIKAN] Tambah /api
      await api.put(`/api/lessons/${selectedLesson.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      Swal.fire({ title: 'Tersimpan!', icon: 'success', timer: 1500, showConfirmButton: false });
      setLessonFile(null);
      fetchCourseData();
    } catch (err) {
      Swal.fire('Error', 'Gagal menyimpan', 'error');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    const res = await Swal.fire({
        title: 'Hapus Materi?',
        text: 'Tindakan ini tidak bisa dibatalkan.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33'
    });
    if (res.isConfirmed) {
        try {
            // [PERBAIKAN] Tambah /api
            await api.delete(`/api/lessons/${lessonId}`);
            setSelectedLesson(null);
            fetchCourseData();
            Swal.fire({ title: 'Terhapus', icon: 'success', timer: 1000, showConfirmButton: false });
        } catch (err) {
            Swal.fire('Gagal', 'Error saat menghapus', 'error');
        }
    }
  };

  const handleAddAssignment = async (moduleId) => {
    const { value: title } = await Swal.fire({
        title: 'Judul Tugas Baru',
        input: 'text',
        showCancelButton: true,
        confirmButtonColor: theme.danger,
        inputPlaceholder: 'Masukkan judul tugas...'
    });
    
    if (title) {
        try {
            // [PERBAIKAN] Tambah /api
            await api.post(`/api/modules/${moduleId}/assignments`, { title: title, description: '', due_date: null });
            fetchCourseData();
        } catch (err) {
            Swal.fire('Error', 'Gagal membuat tugas', 'error');
        }
    }
  };

  const handleUpdateAssignment = async (e) => {
      e.preventDefault();
      try {
          const formData = new FormData();
          formData.append('title', selectedAssignment.title);
          formData.append('description', selectedAssignment.description || '');
          formData.append('link_url', selectedAssignment.link_url || '');
          if (selectedAssignment.due_date) formData.append('due_date', selectedAssignment.due_date);
          if (assignmentFile) formData.append('attachment_file', assignmentFile);

          // [PERBAIKAN] Tambah /api
          await api.post(`/api/assignments/${selectedAssignment.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
          
          Swal.fire({ title: 'Tugas Diupdate!', icon: 'success', timer: 1500, showConfirmButton: false });
          setAssignmentFile(null);
          fetchCourseData();
      } catch (err) {
          Swal.fire('Error', 'Gagal update tugas', 'error');
      }
  };

  const handleDeleteAssignment = async (assignId) => {
      const res = await Swal.fire({
          title: 'Hapus Tugas?',
          text: 'Data pengumpulan siswa juga akan terhapus!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33'
      });
      if(res.isConfirmed) {
          try {
              // [PERBAIKAN] Tambah /api
              await api.delete(`/api/assignments/${assignId}`);
              setSelectedAssignment(null);
              fetchCourseData();
              Swal.fire({ title: 'Terhapus', icon: 'success', timer: 1000, showConfirmButton: false });
          } catch (err) {
              Swal.fire('Gagal', 'Tidak bisa menghapus tugas', 'error');
          }
      }
  };

  const formatDateTimeForInput = (isoString) => {
      if (!isoString) return '';
      return new Date(isoString).toISOString().slice(0, 16);
  };

  if (loading) return <div className="text-center p-5 text-muted">Memuat Editor...</div>;

  return (
    <div className="d-flex flex-column vh-100" style={{ backgroundColor: theme.bg, fontFamily: "'Poppins', sans-serif" }}>
      
      {/* HEADER */}
      <div className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center shadow-sm sticky-top" style={{ zIndex: 10 }}>
        <div className="d-flex align-items-center gap-3">
          <button onClick={() => navigate('/instructor-dashboard')} className="btn btn-light btn-sm rounded-circle border">
            <i className="bi bi-arrow-left"></i>
          </button>
          <div>
             <h5 className="mb-0 fw-bold" style={{color: theme.textMain}}>{course.title}</h5>
             <small className="text-muted">Content Manager</small>
          </div>
        </div>
        <button 
            onClick={() => navigate(`/course/${id}`)} 
            className="btn btn-sm fw-bold px-3 rounded-pill"
            style={{backgroundColor: theme.textMain, color: 'white'}}
        >
          <i className="bi bi-eye me-2"></i>Preview
        </button>
      </div>

      <div className="flex-grow-1 overflow-hidden">
        <div className="row h-100 g-0">
          
          {/* --- SIDEBAR --- */}
          <div className="col-md-4 col-lg-3 bg-white border-end h-100 overflow-auto">
            <div className="p-3">
              <h6 className="fw-bold text-uppercase small mb-3 ls-1" style={{color: theme.primary}}>Daftar Modul</h6>
              
              <div className="accordion" id="accordionModules">
                {modules.map((mod, idx) => (
                  <div className="accordion-item border-0 mb-3 shadow-sm rounded-3 overflow-hidden" key={mod.id}>
                    <h2 className="accordion-header">
                      <button 
                        className="accordion-button fw-bold py-3 shadow-none" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target={`#collapse${mod.id}`}
                        style={{backgroundColor: '#FAFAFA', color: theme.textMain}}
                      >
                        <span className="me-2 text-muted fw-normal">{idx + 1}.</span> {mod.title}
                      </button>
                    </h2>
                    <div id={`collapse${mod.id}`} className="accordion-collapse collapse show" data-bs-parent="#accordionModules">
                      <div className="accordion-body p-0">
                        <div className="list-group list-group-flush">
                          
                          {/* LESSONS */}
                          {mod.lessons.map((lesson) => {
                            const isActive = selectedLesson?.id === lesson.id;
                            return (
                                <button
                                key={`lesson-${lesson.id}`}
                                onClick={() => selectLesson(lesson)}
                                className={`list-group-item list-group-item-action border-0 py-2 small d-flex align-items-center gap-2 px-4`}
                                style={{
                                    backgroundColor: isActive ? theme.primaryLight : 'white',
                                    color: isActive ? theme.primary : '#555',
                                    fontWeight: isActive ? 'bold' : 'normal',
                                    borderLeft: isActive ? `3px solid ${theme.primary}` : '3px solid transparent'
                                }}
                                >
                                <i className={`bi ${lesson.video_url ? 'bi-play-circle' : 'bi-file-text'} fs-6`}></i>
                                <span className="text-truncate">{lesson.title}</span>
                                </button>
                            );
                          })}

                          {/* ASSIGNMENTS */}
                          {mod.assignments && mod.assignments.map((assign) => {
                             const isActive = selectedAssignment?.id === assign.id;
                             return (
                                <button
                                    key={`assign-${assign.id}`}
                                    onClick={() => selectAssignment(assign)}
                                    className={`list-group-item list-group-item-action border-0 py-2 small d-flex align-items-center gap-2 px-4`}
                                    style={{
                                        backgroundColor: isActive ? '#FFF5F5' : 'white',
                                        color: isActive ? theme.danger : theme.danger,
                                        borderLeft: isActive ? `3px solid ${theme.danger}` : '3px solid transparent'
                                    }}
                                >
                                    <i className="bi bi-pencil-square fs-6"></i>
                                    <span className="text-truncate">{assign.title}</span>
                                    <span className="badge ms-auto" style={{backgroundColor: theme.danger, fontSize: '0.6rem'}}>Tugas</span>
                                </button>
                             );
                          })}
                          
                          {/* BUTTONS ADD */}
                          <div className="d-flex border-top">
                              <button onClick={() => handleAddLesson(mod.id)} className="btn btn-link text-decoration-none small fw-bold flex-fill py-2" style={{color: theme.primary}}>
                                + Materi
                              </button>
                              <div className="border-end"></div>
                              <button onClick={() => handleAddAssignment(mod.id)} className="btn btn-link text-decoration-none small fw-bold flex-fill py-2" style={{color: theme.danger}}>
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
                <div className="input-group input-group-sm shadow-sm rounded">
                  <input 
                    type="text" 
                    className="form-control border-0" 
                    placeholder="Nama Modul Baru..." 
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                    style={{backgroundColor: '#F5F5F5'}}
                  />
                  <button className="btn" type="submit" style={{backgroundColor: theme.primary, color: 'white'}}>Tambah</button>
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
                  <h4 className="fw-bold mb-0" style={{color: theme.textMain}}>Edit Pelajaran</h4>
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
                                <input type="text" className="form-control form-control-lg fw-bold border-0 rounded-3 px-3" 
                                    style={{backgroundColor: theme.bg, color: theme.textMain}}
                                    value={selectedLesson.title}
                                    onChange={(e) => setSelectedLesson({...selectedLesson, title: e.target.value})}
                                />
                            </div>

                            {/* UPLOAD FILE */}
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

                            {/* Video URL */}
                            <div className="mb-4">
                                <label className="text-uppercase text-muted fw-bold small mb-1">Atau Masukkan Link URL (Youtube/External)</label>
                                <input type="text" className="form-control border-0 rounded-3 px-3" placeholder="https://youtube.com/..."
                                    style={{backgroundColor: theme.bg}}
                                    value={selectedLesson.video_url || ''}
                                    onChange={(e) => setSelectedLesson({...selectedLesson, video_url: e.target.value})}
                                />
                            </div>

                            {/* Preview */}
                            {selectedLesson.video_url && (
                                <div className="ratio ratio-16x9 mb-4 rounded-3 overflow-hidden bg-dark">
                                    <iframe src={selectedLesson.video_url.replace('watch?v=', 'embed/')} title="Preview"></iframe>
                                </div>
                            )}

                            {/* Deskripsi */}
                            <div className="mb-4">
                                <label className="text-uppercase text-muted fw-bold small mb-1">Isi Materi / Deskripsi</label>
                                <textarea className="form-control border-0 rounded-3 px-3 py-3" rows="10"
                                    style={{backgroundColor: theme.bg}}
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

                            <button type="submit" className="btn btn-lg w-100 rounded-pill fw-bold shadow-sm" style={{backgroundColor: theme.primary, color: 'white'}}>Simpan Perubahan</button>
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
                                <input type="text" className="form-control form-control-lg fw-bold border-0 rounded-3 px-3" 
                                    style={{backgroundColor: '#FFF5F5', color: theme.danger}}
                                    value={selectedAssignment.title}
                                    onChange={(e) => setSelectedAssignment({...selectedAssignment, title: e.target.value})}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="text-uppercase text-muted fw-bold small mb-1">Tenggat Waktu</label>
                                <input 
                                    type="datetime-local" 
                                    className="form-control bg-light border-0 rounded-3 px-3"
                                    style={{maxWidth: '300px'}}
                                    value={formatDateTimeForInput(selectedAssignment.due_date)}
                                    onChange={(e) => setSelectedAssignment({...selectedAssignment, due_date: e.target.value})}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="text-uppercase text-muted fw-bold small mb-1">Instruksi</label>
                                <textarea className="form-control bg-light border-0 rounded-3 px-3 py-3" rows="6"
                                    value={selectedAssignment.description || ''}
                                    onChange={(e) => setSelectedAssignment({...selectedAssignment, description: e.target.value})}
                                ></textarea>
                            </div>

                            <hr className="my-4"/>

                            <div className="mb-4">
                                <label className="text-uppercase text-muted fw-bold small mb-1">Lampiran File</label>
                                <input 
                                    type="file" 
                                    className="form-control"
                                    onChange={(e) => setAssignmentFile(e.target.files[0])}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="text-uppercase text-muted fw-bold small mb-1">Link Referensi</label>
                                <input 
                                    type="text" 
                                    className="form-control bg-light border-0"
                                    value={selectedAssignment.link_url || ''}
                                    onChange={(e) => setSelectedAssignment({...selectedAssignment, link_url: e.target.value})}
                                />
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
                <div className="p-4 rounded-circle shadow-sm mb-3" style={{backgroundColor: 'white'}}>
                  <i className="bi bi-pencil-fill fs-1" style={{color: theme.primary, opacity: 0.5}}></i>
                </div>
                <h4 className="fw-bold" style={{color: theme.textMain}}>Editor Konten</h4>
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