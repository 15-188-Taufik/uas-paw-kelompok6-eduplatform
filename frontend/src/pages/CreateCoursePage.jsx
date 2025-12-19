import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../api/axios';

const CreateCoursePage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    enrollment_key: '' // [BARU]
  });
  const [thumbnailFile, setThumbnailFile] = useState(null); // [BARU] State file
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || user.role !== 'instructor') {
      return <p style={{textAlign:'center', marginTop:'50px'}}>Akses Ditolak. Hanya untuk Instruktur.</p>;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
        setThumbnailFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Gunakan FormData karena ada file upload
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('instructor_id', user.id);
      
      // Tambahkan key (opsional)
      if (formData.enrollment_key) {
          data.append('enrollment_key', formData.enrollment_key);
      }
      
      // Tambahkan file gambar
      if (thumbnailFile) {
          data.append('thumbnail_file', thumbnailFile);
      }

      await api.post('/courses', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // SweetAlert: Toast Notification Success
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });

      Toast.fire({
        icon: 'success',
        title: 'Kursus berhasil dibuat!'
      });
      
      navigate('/instructor-dashboard');
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Terjadi kesalahan saat membuat kursus.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2 style={{ color: '#bc2131', marginTop: 0 }}>Buat Kursus Baru</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Judul Kursus</label>
          <input 
            type="text" name="title" required
            value={formData.title} onChange={handleChange}
            placeholder="Contoh: Belajar Python Dasar"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Kategori</label>
          <input 
            type="text" name="category" required
            value={formData.category} onChange={handleChange}
            placeholder="Contoh: Programming, Desain, Bisnis"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Upload Gambar Cover</label>
          <input 
            type="file" 
            onChange={handleFileChange}
            accept="image/*" // Hanya terima gambar
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', background: '#f9f9f9' }}
          />
          {thumbnailFile && <p style={{color:'green', fontSize:'0.9rem', margin:'5px 0 0'}}>✓ {thumbnailFile.name}</p>}
        </div>

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Enrollment Key (Opsional)</label>
          <input 
            type="text" name="enrollment_key"
            value={formData.enrollment_key} onChange={handleChange}
            placeholder="Kode Kunci (Biarkan kosong jika gratis/publik)"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', background: '#fffbe6' }}
          />
          <small style={{color: '#666'}}>Jika diisi, mahasiswa harus memasukkan kode ini saat mendaftar.</small>
        </div>

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Deskripsi Singkat</label>
          <textarea 
            name="description" rows="4" required
            value={formData.description} onChange={handleChange}
            placeholder="Jelaskan tentang kursus ini..."
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              style={{ flex: 1, padding: '12px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ flex: 1, padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Kursus'}
            </button>
        </div>

      </form>
    </div>
  );
};

export default CreateCoursePage;