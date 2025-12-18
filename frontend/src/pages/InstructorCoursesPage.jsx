import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const InstructorCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Form Buat Kursus (Tampil di halaman yang sama)
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

  // --- FETCH DATA ---
  const fetchCourses = async () => {
    try {
      const response = await api.get(`/instructors/${user.id}/courses`);
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

  // --- HANDLERS ---
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

      await api.post('/courses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Reset Form & Refresh List
      setNewCourse({ title: '', category: 'Pemrograman', description: '', thumbnail_file: null });
      setPreviewThumb(null);
      setShowCreateForm(false);
      fetchCourses();
      alert('Kursus berhasil dibuat!');
    } catch (err) {
      alert('Gagal membuat kursus.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if(!confirm("Yakin ingin menghapus kursus ini beserta seluruh materinya?")) return;
    try {
        await api.delete(`/courses/${courseId}`);
        fetchCourses();
    } catch(err) {
        alert("Gagal menghapus kursus.");
    }
  };

  if (loading) return <div className="p-5 text-center">Loading...</div>;

  return (
    <div className="min-vh-100 py-4" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
            <div>
                <h3 className="fw-bold text-dark mb-1">Manajemen Kursus</h3>
                <p className="text-muted mb-0">Kelola semua kursus Anda atau tambahkan yang baru.</p>
            </div>
            {/* Tombol Toggle Form Buat Kursus */}
            <button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className={`btn ${showCreateForm ? 'btn-secondary' : 'btn-primary'} fw-bold px-4 rounded-pill`}
            >
                {showCreateForm ? <><i className="bi bi-x-lg me-2"></i>Tutup Form</> : <><i className="bi bi-plus-lg me-2"></i>Buat Kursus Baru</>}
            </button>
        </div>

        <div className="row g-4">
            {/* BAGIAN KIRI: DAFTAR KURSUS */}
            <div className={showCreateForm ? "col-lg-8" : "col-12"}>
                {courses.length === 0 ? (
                    <div className="text-center py-5 bg-white rounded shadow-sm">
                        <i className="bi bi-inbox text-muted fs-1"></i>
                        <p className="text-muted mt-2">Belum ada kursus. Silakan buat baru.</p>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {courses.map((course) => (
                            <div className="card border-0 shadow-sm p-3 rounded-4" key={course.id}>
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
                                        <div className="badge bg-primary bg-opacity-10 text-primary mb-1">{course.category}</div>
                                        <h5 className="fw-bold text-dark mb-1 text-truncate">{course.title}</h5>
                                        <p className="text-muted small mb-0 d-none d-md-block text-truncate">
                                            {course.description || 'Tidak ada deskripsi.'}
                                        </p>
                                        <small className="text-muted d-block d-md-none mt-1">ID: {course.id}</small>
                                    </div>
                                    <div className="col-md-3 col-12 mt-3 mt-md-0 d-flex flex-row flex-md-column gap-2 justify-content-end">
                                        <button 
                                            onClick={() => navigate(`/manage-course/${course.id}`)}
                                            className="btn btn-sm btn-outline-primary fw-bold rounded-pill"
                                        >
                                            <i className="bi bi-collection-play me-1"></i> Materi
                                        </button>
                                        <div className="d-flex gap-2">
                                            <button 
                                                onClick={() => navigate(`/edit-course/${course.id}`)}
                                                className="btn btn-sm btn-light border flex-grow-1 rounded-pill"
                                                title="Edit Info"
                                            >
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

            {/* BAGIAN KANAN: FORM BUAT KURSUS (Muncul jika tombol diklik) */}
            {showCreateForm && (
                <div className="col-lg-4">
                    <div className="card border-0 shadow rounded-4 sticky-top" style={{ top: '90px' }}>
                        <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                            <h5 className="fw-bold text-primary mb-0">Form Kursus Baru</h5>
                        </div>
                        <div className="card-body p-4">
                            <form onSubmit={handleCreateCourse}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">JUDUL KURSUS</label>
                                    <input 
                                        type="text" className="form-control" required
                                        value={newCourse.title}
                                        onChange={e => setNewCourse({...newCourse, title: e.target.value})}
                                        placeholder="Contoh: Belajar React Dasar"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">KATEGORI</label>
                                    <select 
                                        className="form-select"
                                        value={newCourse.category}
                                        onChange={e => setNewCourse({...newCourse, category: e.target.value})}
                                    >
                                        <option value="Pemrograman">Pemrograman</option>
                                        <option value="Desain">Desain</option>
                                        <option value="Bisnis">Bisnis</option>
                                        <option value="Akademik">Akademik</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">DESKRIPSI SINGKAT</label>
                                    <textarea 
                                        className="form-control" rows="3"
                                        value={newCourse.description}
                                        onChange={e => setNewCourse({...newCourse, description: e.target.value})}
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
                                    <button type="submit" className="btn btn-primary fw-bold py-2" disabled={creating}>
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