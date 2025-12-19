import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../api/axios';

const InstructorCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    category: 'Pemrograman',
    description: '',
    thumbnail_file: null
  });
  const [previewThumb, setPreviewThumb] = useState(null);
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // --- THEME ---
  const theme = {
    primary: '#FF7E3E',
    primaryLight: '#FFF5F1',
    bg: '#FDF8F4',
    textMain: '#2D2D2D',
    textSec: '#757575',
    shadow: '0 10px 25px rgba(255, 126, 62, 0.08)',
  };

  const fetchCourses = async () => {
    try {
      // [PERBAIKAN] Tambah /api di depan
      const response = await api.get(`/api/instructors/${user.id}/courses`);
      setCourses(response.data.courses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'instructor') {
        navigate('/');
        return;
    }
    fetchCourses();
  }, [user, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCourse({ ...newCourse, thumbnail_file: file });
      setPreviewThumb(URL.createObjectURL(file));
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append('title', newCourse.title);
      formData.append('category', newCourse.category);
      formData.append('description', newCourse.description);
      formData.append('instructor_id', user.id);
      if (newCourse.thumbnail_file) {
        formData.append('thumbnail_file', newCourse.thumbnail_file);
      }

      // [PERBAIKAN] Tambah /api di depan
      await api.post('/api/courses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Reset
      setNewCourse({ title: '', category: 'Pemrograman', description: '', thumbnail_file: null });
      setPreviewThumb(null);
      setShowCreateForm(false);
      fetchCourses();
      
      Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Kursus baru berhasil dibuat.',
          confirmButtonColor: theme.primary
      });
    } catch (err) {
      Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'Terjadi kesalahan saat membuat kursus.',
          confirmButtonColor: theme.primary
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    const result = await Swal.fire({
        title: 'Hapus Kursus?',
        text: "Seluruh materi dan data siswa di kursus ini akan dihapus permanen!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
        try {
            // [PERBAIKAN] Tambah /api di depan
            await api.delete(`/api/courses/${courseId}`);
            fetchCourses();
            Swal.fire({ title: 'Terhapus!', icon: 'success', timer: 1500, showConfirmButton: false });
        } catch(err) {
            Swal.fire({ icon: 'error', title: 'Gagal menghapus', text: err.message });
        }
    }
  };

  if (loading) return <div className="p-5 text-center">Loading...</div>;

  return (
    <div className="min-vh-100 py-4" style={{ backgroundColor: theme.bg, fontFamily: "'Poppins', sans-serif" }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3" style={{ borderBottom: `2px solid ${theme.primaryLight}` }}>
            <div>
                <h3 className="fw-bold mb-1" style={{color: theme.textMain}}>Manajemen Kursus</h3>
                <p className="mb-0" style={{color: theme.textSec}}>Kelola semua kursus Anda atau tambahkan yang baru.</p>
            </div>
            <button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="btn fw-bold px-4 rounded-pill shadow-sm"
                style={{
                    backgroundColor: showCreateForm ? '#EAEAEA' : theme.primary,
                    color: showCreateForm ? theme.textMain : 'white',
                    border: 'none'
                }}
            >
                {showCreateForm ? <><i className="bi bi-x-lg me-2"></i>Tutup Form</> : <><i className="bi bi-plus-lg me-2"></i>Buat Kursus Baru</>}
            </button>
        </div>

        <div className="row g-4">
            {/* DAFTAR KURSUS */}
            <div className={showCreateForm ? "col-lg-8" : "col-12"}>
                {courses.length === 0 ? (
                    <div className="text-center py-5 bg-white rounded shadow-sm">
                        <i className="bi bi-inbox fs-1" style={{color: theme.primary}}></i>
                        <p className="mt-2" style={{color: theme.textSec}}>Belum ada kursus. Silakan buat baru.</p>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {courses.map((course) => (
                            <div className="card border-0 p-3 rounded-4" key={course.id} style={{boxShadow: theme.shadow}}>
                                <div className="row g-0 align-items-center">
                                    <div className="col-md-3 col-4">
                                        <img 
                                            src={course.thumbnail_url || 'https://via.placeholder.com/200x120'} 
                                            alt={course.title}
                                            className="img-fluid rounded-3"
                                            style={{ objectFit: 'cover', height: '100%', minHeight: '100px' }}
                                        />
                                    </div>
                                    <div className="col-md-6 col-8 ps-3">
                                        <div className="badge mb-1" style={{backgroundColor: theme.primaryLight, color: theme.primary}}>{course.category}</div>
                                        <h5 className="fw-bold mb-1 text-truncate" style={{color: theme.textMain}}>{course.title}</h5>
                                        <p className="small mb-0 d-none d-md-block text-truncate" style={{color: theme.textSec}}>
                                            {course.description || 'Tidak ada deskripsi.'}
                                        </p>
                                    </div>
                                    <div className="col-md-3 col-12 mt-3 mt-md-0 d-flex flex-row flex-md-column gap-2 justify-content-end">
                                        <button
                                            onClick={() => navigate(`/manage-course/${course.id}`)}
                                            className="btn btn-sm fw-bold rounded-pill"
                                            style={{border: `1px solid ${theme.primary}`, color: theme.primary}}
                                        >
                                            <i className="bi bi-collection-play me-1"></i> Materi
                                        </button>
                                        <button
                                            onClick={() => navigate(`/course-students/${course.id}`)}
                                            className="btn btn-sm fw-bold rounded-pill"
                                            style={{border: `1px solid ${theme.primary}`, color: theme.primary}}
                                        >
                                            <i className="bi bi-people me-1"></i> Siswa
                                        </button>
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-sm btn-light border flex-grow-1 rounded-pill" title="Edit Info">
                                                <i className="bi bi-pencil-square"></i> Info
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCourse(course.id)}
                                                className="btn btn-sm btn-light border text-danger rounded-pill"
                                                title="Hapus"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FORM BUAT KURSUS */}
            {showCreateForm && (
                <div className="col-lg-4">
                    <div className="card border-0 rounded-4 sticky-top" style={{ top: '90px', boxShadow: theme.shadow }}>
                        <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                            <h5 className="fw-bold mb-0" style={{color: theme.primary}}>Form Kursus Baru</h5>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleCreateCourse}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">JUDUL KURSUS</label>
                                    <input 
                                        type="text" className="form-control" required
                                        value={newCourse.title}
                                        onChange={e => setNewCourse({...newCourse, title: e.target.value})}
                                        style={{backgroundColor: theme.bg, border: 'none'}}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">KATEGORI</label>
                                    <select 
                                        className="form-select"
                                        value={newCourse.category}
                                        onChange={e => setNewCourse({...newCourse, category: e.target.value})}
                                        style={{backgroundColor: theme.bg, border: 'none'}}
                                    >
                                        <option value="Pemrograman">Pemrograman</option>
                                        <option value="Desain">Desain</option>
                                        <option value="Bisnis">Bisnis</option>
                                        <option value="Akademik">Akademik</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">DESKRIPSI</label>
                                    <textarea 
                                        className="form-control" rows="3"
                                        value={newCourse.description}
                                        onChange={e => setNewCourse({...newCourse, description: e.target.value})}
                                        style={{backgroundColor: theme.bg, border: 'none'}}
                                    ></textarea>
                                </div>
                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-muted">THUMBNAIL</label>
                                    <input type="file" className="form-control form-control-sm" onChange={handleFileChange} accept="image/*" />
                                    {previewThumb && (
                                        <div className="mt-2 rounded overflow-hidden border">
                                            <img src={previewThumb} alt="Preview" className="w-100" style={{ height: '120px', objectFit: 'cover' }} />
                                        </div>
                                    )}
                                </div>
                                <div className="d-grid">
                                    <button type="submit" className="btn fw-bold py-2" disabled={creating} style={{backgroundColor: theme.primary, color: 'white', borderRadius: '12px'}}>
                                        {creating ? 'Memproses...' : 'Simpan Kursus Baru'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default InstructorCoursesPage;