import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // Tambah useLocation
import Swal from 'sweetalert2';
import api from '../api/axios';

const ManageCoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Hook untuk menangkap state dari halaman sebelumnya
  
  // --- STATE DATA ---
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE EDIT COURSE INFO ---
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [courseTemp, setCourseTemp] = useState({});
  const [courseThumbnailFile, setCourseThumbnailFile] = useState(null);
  const [previewThumbnail, setPreviewThumbnail] = useState(null);

  // --- STATE EDIT CONTENT ---
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [newModuleTitle, setNewModuleTitle] = useState('');
  
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [lessonFile, setLessonFile] = useState(null);

  // --- THEME ---
  const theme = {
    primary: '#FF7E3E',
    primaryGradient: 'linear-gradient(135deg, #FF7E3E 0%, #FF5F6D 100%)',
    bg: '#f0f2f5',
    glass: {
      background: 'rgba(255, 255, 255, 0.65)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
    },
    textMain: '#2D2D2D',
    danger: '#FF4D4F'
  };

  // --- USE EFFECT UTAMA ---
  useEffect(() => {
    fetchCourseData();
  }, [id]);

  // --- USE EFFECT DETEKSI NAVIGASI DARI TOMBOL INFO ---
  useEffect(() => {
    // Jika ada state openInfo dari halaman sebelumnya, langsung buka mode edit
    if (location.state?.openInfo) {
      setIsEditingCourse(true);
      // Scroll ke paling atas agar terlihat
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.state]);

  const fetchCourseData = async () => {
    try {
      const courseRes = await api.get(`/api/courses/${id}`);
      setCourse(courseRes.data.course);
      
      // Set initial data for editing
      setCourseTemp({
        title: courseRes.data.course.title,
        category: courseRes.data.course.category || 'Uncategorized',
        enrollment_key: courseRes.data.course.enrollment_key || '',
        description: courseRes.data.course.description || '',
      });
      setPreviewThumbnail(courseRes.data.course.thumbnail_url);

      const modulesRes = await api.get(`/api/courses/${id}/modules`);
      const modulesData = modulesRes.data.modules;

      const modulesWithContent = await Promise.all(modulesData.map(async (mod) => {
        const [lessonsRes, assignsRes] = await Promise.all([
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
      console.error("Error fetching data:", err);
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

  // --- HANDLERS: COURSE INFO (FIXED) ---
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourseThumbnailFile(file);
      setPreviewThumbnail(URL.createObjectURL(file));
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    
    // Tampilkan Loading Swal
    Swal.fire({
        title: 'Menyimpan...',
        text: 'Mohon tunggu sebentar',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    try {
      const formData = new FormData();
      formData.append('title', courseTemp.title);
      formData.append('category', courseTemp.category);
      formData.append('enrollment_key', courseTemp.enrollment_key);
      formData.append('description', courseTemp.description);
      
      // [PENTING] Method Spoofing: Kirim sebagai POST, tapi backend baca sebagai PUT
      // Ini trik agar file upload terbaca saat update
      formData.append('_method', 'PUT'); 

      if (courseThumbnailFile) {
        formData.append('thumbnail', courseThumbnailFile);
      }

      // Gunakan POST ke endpoint update (karena ada _method: PUT di formData)
      await api.post(`/api/courses/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Swal.fire({
        title: 'Berhasil!',
        text: 'Informasi kursus diperbarui',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      
      setIsEditingCourse(false);
      fetchCourseData(); // Refresh data agar tampilan terupdate
    } catch (err) {
      console.error("Error Updating Course:", err.response || err);
      // Tampilkan pesan error spesifik jika ada dari backend
      const errMsg = err.response?.data?.message || 'Terjadi kesalahan saat menyimpan info kursus';
      Swal.fire('Gagal', errMsg, 'error');
    }
  };

  // --- HANDLERS: MODULES & CONTENT ---
  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;
    try {
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
      formData.append('is_preview', selectedLesson.is_preview ? 1 : 0);
      
      // Sama seperti update course, gunakan spoofing jika ada file
      formData.append('_method', 'PUT');

      if (lessonFile) formData.append('file_material', lessonFile);

      // Gunakan POST + _method: PUT
      await api.post(`/api/lessons/${selectedLesson.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      Swal.fire({ title: 'Tersimpan!', icon: 'success', timer: 1500, showConfirmButton: false });
      setLessonFile(null);
      fetchCourseData();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Gagal menyimpan materi', 'error');
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
          
          formData.append('_method', 'PUT'); // Method spoofing
          if (assignmentFile) formData.append('attachment_file', assignmentFile);

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

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{backgroundColor: theme.bg}}>
        <div className="spinner-border text-warning" role="status"></div>
    </div>
  );

  return (
    <div className="d-flex flex-column vh-100" style={{ backgroundColor: theme.bg, fontFamily: "'Poppins', sans-serif" }}>
      
      {/* HEADER GLASS */}
      <div className="px-4 py-3 d-flex justify-content-between align-items-center sticky-top" 
           style={{ ...theme.glass, zIndex: 50 }}>
        <div className="d-flex align-items-center gap-3">
          <button onClick={() => navigate('/instructor-dashboard')} className="btn btn-light btn-sm rounded-circle border shadow-sm">
            <i className="bi bi-arrow-left"></i>
          </button>
          <div>
             <h5 className="mb-0 fw-bold" style={{color: theme.textMain}}>Manage Course</h5>
             <small className="text-muted">Editor & Settings</small>
          </div>
        </div>
        <button 
            onClick={() => navigate(`/course/${id}`)} 
            className="btn btn-sm fw-bold px-4 rounded-pill shadow-sm text-white"
            style={{background: theme.primaryGradient}}
        >
          <i className="bi bi-eye me-2"></i>Preview Course
        </button>
      </div>

      <div className="flex-grow-1 overflow-hidden">
        <div className="row h-100 g-0">
          
          {/* --- SIDEBAR: MODULES --- */}
          <div className="col-md-4 col-lg-3 h-100 overflow-auto border-end" style={{backgroundColor: 'rgba(255,255,255,0.5)'}}>
            <div className="p-3">
              <h6 className="fw-bold text-uppercase small mb-3 ls-1 ps-2" style={{color: theme.primary}}>Structure</h6>
              
              <div className="accordion" id="accordionModules">
                {modules.map((mod, idx) => (
                  <div className="accordion-item border-0 mb-3 shadow-sm rounded-4 overflow-hidden" key={mod.id} style={{backgroundColor: 'white'}}>
                    <h2 className="accordion-header">
                      <button 
                        className="accordion-button fw-bold py-3 shadow-none" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target={`#collapse${mod.id}`}
                        style={{backgroundColor: '#fff', color: theme.textMain}}
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
                                    backgroundColor: isActive ? 'rgba(255, 126, 62, 0.1)' : 'transparent',
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
                                        backgroundColor: isActive ? '#FFF5F5' : 'transparent',
                                        color: isActive ? theme.danger : theme.danger,
                                        borderLeft: isActive ? `3px solid ${theme.danger}` : '3px solid transparent'
                                    }}
                                >
                                    <i className="bi bi-pencil-square fs-6"></i>
                                    <span className="text-truncate">{assign.title}</span>
                                </button>
                             );
                          })}
                          
                          {/* BUTTONS ADD */}
                          <div className="d-flex border-top mt-1">
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
                <div className="input-group shadow-sm rounded-pill overflow-hidden bg-white">
                  <input 
                    type="text" 
                    className="form-control border-0 ps-3" 
                    placeholder="Nama Modul Baru..." 
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                  />
                  <button className="btn fw-bold px-3" type="submit" style={{backgroundColor: theme.primary, color: 'white'}}>Add</button>
                </div>
              </form>

            </div>
          </div>

          {/* --- MAIN CONTENT AREA --- */}
          <div className="col-md-8 col-lg-9 h-100 overflow-auto pb-5">
            <div className="container-fluid p-4">

                {/* 1. COURSE INFO SECTION (Glass Card) */}
                <div id="courseInfoSection" className="mb-5 rounded-4 p-4 fade-in-up" style={theme.glass}>
                    <div className="d-flex justify-content-between align-items-start mb-4">
                        <h4 className="fw-bold m-0" style={{color: theme.textMain}}>Informasi Kursus</h4>
                        {!isEditingCourse && (
                            <button 
                                onClick={() => setIsEditingCourse(true)}
                                className="btn btn-sm btn-outline-dark rounded-pill px-3"
                            >
                                <i className="bi bi-pencil me-2"></i>Edit Info
                            </button>
                        )}
                    </div>

                    {isEditingCourse ? (
                        /* MODE EDIT */
                        <form onSubmit={handleUpdateCourse} className="row g-4">
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted">Thumbnail Kursus</label>
                                <div 
                                    className="ratio ratio-16x9 rounded-3 overflow-hidden border mb-2 d-flex align-items-center justify-content-center bg-light"
                                    style={{cursor: 'pointer'}}
                                    onClick={() => document.getElementById('thumbnailInput').click()}
                                >
                                    {previewThumbnail ? (
                                        <img src={previewThumbnail} alt="Preview" className="w-100 h-100 object-fit-cover" />
                                    ) : (
                                        <div className="text-center text-muted">
                                            <i className="bi bi-image fs-1"></i>
                                            <p className="small m-0">Upload Image</p>
                                        </div>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    id="thumbnailInput"
                                    accept="image/*"
                                    className="d-none"
                                    onChange={handleThumbnailChange}
                                />
                                <div className="text-center">
                                    <label htmlFor="thumbnailInput" className="btn btn-sm btn-light border rounded-pill small">
                                        Pilih Gambar
                                    </label>
                                </div>
                            </div>
                            
                            <div className="col-md-8">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-muted">Judul Kursus</label>
                                        <input 
                                            type="text" 
                                            className="form-control rounded-3" 
                                            value={courseTemp.title}
                                            onChange={(e) => setCourseTemp({...courseTemp, title: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted">Kategori</label>
                                        <select 
                                            className="form-select rounded-3"
                                            value={courseTemp.category}
                                            onChange={(e) => setCourseTemp({...courseTemp, category: e.target.value})}
                                        >
                                            <option value="Technology">Technology</option>
                                            <option value="Business">Business</option>
                                            <option value="Design">Design</option>
                                            <option value="Science">Science</option>
                                            <option value="Uncategorized">Uncategorized</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted">Enrollment Key</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white border-end-0"><i className="bi bi-key"></i></span>
                                            <input 
                                                type="text" 
                                                className="form-control border-start-0 rounded-end-3" 
                                                value={courseTemp.enrollment_key}
                                                onChange={(e) => setCourseTemp({...courseTemp, enrollment_key: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-muted">Deskripsi</label>
                                        <textarea 
                                            className="form-control rounded-3" 
                                            rows="3"
                                            value={courseTemp.description}
                                            onChange={(e) => setCourseTemp({...courseTemp, description: e.target.value})}
                                        ></textarea>
                                    </div>
                                    <div className="col-12 d-flex justify-content-end gap-2 mt-3">
                                        <button 
                                            type="button" 
                                            onClick={() => { setIsEditingCourse(false); setPreviewThumbnail(course.thumbnail_url); }} 
                                            className="btn btn-light rounded-pill px-4"
                                        >
                                            Batal
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary rounded-pill px-4 text-white border-0"
                                            style={{background: theme.primaryGradient}}
                                        >
                                            Simpan Info
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    ) : (
                        /* MODE VIEW */
                        <div className="row align-items-center">
                            <div className="col-md-3">
                                <div className="ratio ratio-16x9 rounded-3 overflow-hidden shadow-sm">
                                    <img 
                                        src={course?.thumbnail_url || 'https://via.placeholder.com/300x200?text=No+Thumbnail'} 
                                        alt="Thumbnail" 
                                        className="object-fit-cover"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Error+Image'; }}
                                    />
                                </div>
                            </div>
                            <div className="col-md-9">
                                <div className="d-flex gap-2 mb-2">
                                    <span className="badge bg-light text-dark border">{course?.category}</span>
                                    {course?.enrollment_key && (
                                        <span className="badge bg-warning text-dark bg-opacity-25 border border-warning">
                                            <i className="bi bi-key-fill me-1"></i> {course.enrollment_key}
                                        </span>
                                    )}
                                </div>
                                <h2 className="fw-bold mb-2">{course?.title}</h2>
                                <p className="text-muted small mb-0">{course?.description || 'Belum ada deskripsi.'}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* DIVIDER */}
                <hr className="my-5 opacity-25" />

                {/* 2. EDITOR LESSON AREA */}
                {selectedLesson && (
                <div className="fade-in-up mx-auto" style={{ maxWidth: '900px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0 text-muted text-uppercase ls-1">Edit Materi</h5>
                    <button onClick={() => handleDeleteLesson(selectedLesson.id)} className="btn btn-outline-danger btn-sm rounded-pill px-3">
                        <i className="bi bi-trash me-1"></i> Hapus
                    </button>
                    </div>
                    
                    <div className="card border-0 rounded-4 overflow-hidden" style={theme.glass}>
                        <div className="card-body p-4 p-lg-5">
                            <form onSubmit={handleUpdateLesson}>
                                {/* Judul */}
                                <div className="mb-4">
                                    <label className="text-uppercase text-muted fw-bold small mb-1">Judul Materi</label>
                                    <input type="text" className="form-control form-control-lg fw-bold border-0 rounded-3 px-3 bg-white bg-opacity-50" 
                                        value={selectedLesson.title}
                                        onChange={(e) => setSelectedLesson({...selectedLesson, title: e.target.value})}
                                    />
                                </div>

                                {/* UPLOAD FILE */}
                                <div className="mb-4">
                                    <label className="text-uppercase text-muted fw-bold small mb-1">Upload File (Video/PDF)</label>
                                    <input 
                                        type="file" 
                                        className="form-control bg-white bg-opacity-50"
                                        onChange={(e) => setLessonFile(e.target.files[0])}
                                        accept="video/*,image/*,.pdf,.doc,.docx,.ppt,.pptx"
                                    />
                                    <div className="form-text small">Upload file akan menggantikan materi sebelumnya.</div>
                                </div>

                                {/* Video URL */}
                                <div className="mb-4">
                                    <label className="text-uppercase text-muted fw-bold small mb-1">Atau Link URL (Youtube)</label>
                                    <input type="text" className="form-control border-0 rounded-3 px-3 bg-white bg-opacity-50" placeholder="https://youtube.com/..."
                                        value={selectedLesson.video_url || ''}
                                        onChange={(e) => setSelectedLesson({...selectedLesson, video_url: e.target.value})}
                                    />
                                </div>

                                {/* Preview */}
                                {selectedLesson.video_url && (
                                    <div className="ratio ratio-16x9 mb-4 rounded-3 overflow-hidden bg-dark shadow-sm">
                                        <iframe src={selectedLesson.video_url.replace('watch?v=', 'embed/')} title="Preview"></iframe>
                                    </div>
                                )}

                                {/* Deskripsi */}
                                <div className="mb-4">
                                    <label className="text-uppercase text-muted fw-bold small mb-1">Isi Materi / Deskripsi</label>
                                    <textarea className="form-control border-0 rounded-3 px-3 py-3 bg-white bg-opacity-50" rows="8"
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

                                <button type="submit" className="btn btn-lg w-100 rounded-pill fw-bold shadow-sm text-white border-0" 
                                        style={{background: theme.primaryGradient}}>Simpan Materi</button>
                            </form>
                        </div>
                    </div>
                </div>
                )}

                {/* 3. EDITOR ASSIGNMENT AREA */}
                {selectedAssignment && (
                <div className="fade-in-up mx-auto" style={{ maxWidth: '900px' }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="fw-bold mb-0 text-danger text-uppercase ls-1">Edit Tugas</h5>
                        <div className="d-flex gap-2">
                            <button 
                                onClick={() => navigate(`/grading/${selectedAssignment.id}`)}
                                className="btn btn-success btn-sm rounded-pill px-3 fw-bold"
                            >
                                <i className="bi bi-clipboard-check me-2"></i>Nilai Submission
                            </button>
                            <button onClick={() => handleDeleteAssignment(selectedAssignment.id)} className="btn btn-outline-danger btn-sm rounded-pill px-3">
                                <i className="bi bi-trash me-1"></i>
                            </button>
                        </div>
                    </div>

                    <div className="card border-0 rounded-4 overflow-hidden" style={theme.glass}>
                        <div className="card-body p-4 p-lg-5">
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
                                            className="form-control bg-white bg-opacity-50 border-0 rounded-3 px-3"
                                            style={{maxWidth: '300px'}}
                                            value={formatDateTimeForInput(selectedAssignment.due_date)}
                                            onChange={(e) => setSelectedAssignment({...selectedAssignment, due_date: e.target.value})}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="text-uppercase text-muted fw-bold small mb-1">Instruksi</label>
                                        <textarea className="form-control bg-white bg-opacity-50 border-0 rounded-3 px-3 py-3" rows="6"
                                            value={selectedAssignment.description || ''}
                                            onChange={(e) => setSelectedAssignment({...selectedAssignment, description: e.target.value})}
                                        ></textarea>
                                    </div>

                                    <div className="mb-4">
                                        <label className="text-uppercase text-muted fw-bold small mb-1">Lampiran Soal (File)</label>
                                        <input 
                                            type="file" 
                                            className="form-control bg-white bg-opacity-50"
                                            onChange={(e) => setAssignmentFile(e.target.files[0])}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="text-uppercase text-muted fw-bold small mb-1">Link Referensi</label>
                                        <input 
                                            type="text" 
                                            className="form-control bg-white bg-opacity-50 border-0"
                                            value={selectedAssignment.link_url || ''}
                                            onChange={(e) => setSelectedAssignment({...selectedAssignment, link_url: e.target.value})}
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-danger btn-lg w-100 rounded-pill fw-bold shadow-sm mt-3 border-0" 
                                            style={{background: 'linear-gradient(135deg, #FF4D4F 0%, #FF7875 100%)'}}>
                                        Simpan Tugas
                                    </button>
                            </form>
                        </div>
                    </div>
                </div>
                )}

                {/* 4. EMPTY STATE */}
                {!selectedLesson && !selectedAssignment && !isEditingCourse && (
                    <div className="d-flex flex-column justify-content-center align-items-center text-muted p-5 mt-4 text-center opacity-50">
                        <i className="bi bi-arrow-left-circle fs-1 mb-2"></i>
                        <p>Pilih Materi atau Tugas di samping untuk mulai mengedit detail konten.</p>
                    </div>
                )}

            </div>
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
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
        `}
      </style>
    </div>
  );
};

export default ManageCoursePage;