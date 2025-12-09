import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AssignmentPage = () => {
  const { id } = useParams(); // ID Assignment
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState(null);
  const [mySubmission, setMySubmission] = useState(null); // Data pengumpulan user
  const [loading, setLoading] = useState(true);
  
  // State Form Input
  const [selectedFile, setSelectedFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user'));

  // 1. Fetch Data Tugas & Data Submission Saya
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil info tugas
        const assignRes = await api.get(`/assignments/${id}`);
        setAssignment(assignRes.data.assignment);

        // Ambil info submission user (kalau sudah login)
        if (user) {
            const subRes = await api.get(`/assignments/${id}/my_submission`, {
                params: { student_id: user.id }
            });
            if (subRes.data.submitted) {
                setMySubmission(subRes.data.submission);
            }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user?.id]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
        setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
        alert("Silakan login dulu.");
        return;
    }
    
    if (!selectedFile && !linkUrl) {
        alert("Harap upload File atau masukkan Link Tugas.");
        return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('student_id', user.id);
      formData.append('submission_link', linkUrl);
      
      if (selectedFile) {
        formData.append('submission_file', selectedFile);
      }

      await api.post(`/assignments/${id}/submissions`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert("Tugas berhasil dikirim!");
      window.location.reload(); // Reload halaman agar status terupdate
    } catch (err) {
      console.error(err);
      alert("Gagal mengirim tugas. Coba lagi.");
      setIsSubmitting(false);
    }
  };

  if (loading) return <p style={{textAlign: 'center', marginTop: '50px'}}>Memuat...</p>;
  if (!assignment) return <p style={{textAlign: 'center', marginTop: '50px'}}>Tugas tidak ditemukan.</p>;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ marginBottom: '20px', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
      >
        ← Kembali
      </button>

      {/* Detail Tugas */}
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
        <h2 style={{ color: '#bc2131', marginTop: 0 }}>📝 {assignment.title}</h2>
        <p style={{ fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>{assignment.description}</p>
        {assignment.due_date && (
          <p style={{ color: '#d9534f', fontWeight: 'bold' }}>Deadline: {assignment.due_date}</p>
        )}
      </div>

      {/* STATUS PENGUMPULAN */}
      {mySubmission ? (
        <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
          <h3 style={{ marginTop: 0, color: '#0369a1' }}>✅ Status Pengumpulan</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', fontSize: '1rem' }}>
            <strong>Status:</strong> 
            <span style={{ color: 'green', fontWeight: 'bold' }}>Dikumpulkan</span>
            
            <strong>Waktu Kirim:</strong>
            <span>{new Date(mySubmission.submitted_at).toLocaleString()}</span>

            <strong>File/Link:</strong>
            <a href={mySubmission.file_url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
              Buka Lampiran
            </a>

            {mySubmission.text && (
               <>
                 <strong>Link Tambahan:</strong>
                 <a href={mySubmission.text} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
                   {mySubmission.text}
                 </a>
               </>
            )}

            <strong>Nilai:</strong>
            <span>
              {mySubmission.grade !== null 
                ? <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#bc2131' }}>{mySubmission.grade} / 100</span> 
                : <span style={{ color: '#666', fontStyle: 'italic' }}>Belum dinilai</span>}
            </span>

            {mySubmission.feedback && (
              <>
                <strong>Feedback:</strong>
                <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}>
                  {mySubmission.feedback}
                </div>
              </>
            )}
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
             <button 
                onClick={() => setMySubmission(null)} // Tombol Resubmit (Reset state tampilan)
                style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
             >
                Edit / Kirim Ulang
             </button>
          </div>
        </div>
      ) : (
        /* FORMULIR PENGUMPULAN (Hanya muncul jika belum kumpul / mode edit) */
        <div style={{ animation: 'fadeIn 0.5s' }}>
            <h3>Upload Tugas Anda</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ padding: '15px', border: '1px dashed #ccc', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                    Opsi 1: Upload File (PDF/Doc/Zip)
                </label>
                <input 
                    type="file" 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.zip,.png,.jpg"
                    style={{ width: '100%' }}
                />
                {selectedFile && <p style={{ fontSize: '0.9rem', color: 'green', marginTop: '5px' }}>✓ File: {selectedFile.name}</p>}
                </div>

                <div style={{ padding: '15px', border: '1px dashed #ccc', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                    Opsi 2: Link Tugas
                </label>
                <input 
                    type="url" 
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://..."
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                </div>

                <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ 
                    padding: '15px', 
                    backgroundColor: isSubmitting ? '#ccc' : '#007bff', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    fontWeight: 'bold', 
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontSize: '1rem'
                }}
                >
                {isSubmitting ? 'Mengirim...' : 'Kirim Tugas'}
                </button>
            </form>
        </div>
      )}
    </div>
  );
};

export default AssignmentPage;