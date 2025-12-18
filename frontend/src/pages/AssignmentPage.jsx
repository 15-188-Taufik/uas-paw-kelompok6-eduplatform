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

  if (loading) return <div className="text-center p-5">Memuat data tugas...</div>;
  if (!assignment) return <div className="text-center p-5 text-danger">Tugas tidak ditemukan.</div>;

  // --- LOGIKA DEADLINE ---
  const deadlineDate = assignment.due_date ? new Date(assignment.due_date) : null;
  const now = new Date();
  
  // Cek apakah telat (Hanya jika ada deadline)
  const isOverdue = deadlineDate && now > deadlineDate;

  // Format Tanggal (Contoh: Senin, 20 Desember 2025, 23:59)
  const formattedDeadline = deadlineDate 
    ? deadlineDate.toLocaleString('id-ID', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      }) 
    : null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      
      {/* Tombol Kembali */}
      <button 
        onClick={() => navigate(-1)} 
        className="mb-4 d-flex align-items-center gap-2"
        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.95rem' }}
      >
        <i className="bi bi-arrow-left"></i> Kembali ke Materi
      </button>

      {/* HEADER TUGAS */}
      <div style={{ 
          backgroundColor: '#fff', 
          border: '1px solid #e2e8f0', 
          borderRadius: '16px', 
          padding: '30px', 
          marginBottom: '30px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
             <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#1e293b' }}>{assignment.title}</h1>
             {/* Badge Deadline */}
             {formattedDeadline && (
                 <div style={{ 
                     backgroundColor: isOverdue ? '#fef2f2' : '#eff6ff', 
                     color: isOverdue ? '#ef4444' : '#3b82f6',
                     padding: '6px 12px', 
                     borderRadius: '20px',
                     fontSize: '0.85rem',
                     fontWeight: '600',
                     border: `1px solid ${isOverdue ? '#fecaca' : '#bfdbfe'}`
                 }}>
                    {isOverdue ? '⚠️ Terlambat' : '🕒 Deadline:'} {formattedDeadline}
                 </div>
             )}
        </div>
        
        <p style={{ fontSize: '1rem', color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
            {assignment.description}
        </p>
      </div>

      {/* AREA PENGUMPULAN */}
      {mySubmission ? (
        // 1. JIKA SUDAH MENGUMPULKAN
        <div style={{ 
            backgroundColor: '#f0fdf4', 
            border: '1px solid #bbf7d0', 
            borderRadius: '16px', 
            padding: '30px' 
        }}>
          <h3 style={{ marginTop: 0, color: '#15803d', display:'flex', alignItems:'center', gap:'10px' }}>
             ✅ Tugas Dikumpulkan
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px', fontSize: '0.95rem', marginTop: '20px' }}>
            <div style={{ color: '#64748b' }}>Waktu Kirim</div>
            <div style={{ fontWeight: '500' }}>{new Date(mySubmission.submitted_at).toLocaleString('id-ID')}</div>

            <div style={{ color: '#64748b' }}>File Lampiran</div>
            <div>
                 {mySubmission.file_url ? (
                    <a href={mySubmission.file_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
                      📄 Lihat File Saya
                    </a>
                 ) : '-'}
            </div>

            {mySubmission.text && (
               <>
                 <div style={{ color: '#64748b' }}>Link / Catatan</div>
                 <div>
                   <a href={mySubmission.text} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
                     {mySubmission.text}
                   </a>
                 </div>
               </>
            )}

            <div style={{ color: '#64748b' }}>Nilai</div>
            <div>
              {mySubmission.grade !== null 
                ? <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#15803d' }}>{mySubmission.grade}<span style={{fontSize:'1rem', fontWeight:'normal', color:'#64748b'}}>/100</span></span> 
                : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Menunggu penilaian instruktur...</span>}
            </div>
            
            {mySubmission.feedback && (
                <>
                    <div style={{ color: '#64748b' }}>Feedback Guru</div>
                    <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0', color:'#334155' }}>
                        "{mySubmission.feedback}"
                    </div>
                </>
            )}
          </div>

          {!isOverdue && (
              <div style={{ marginTop: '25px', borderTop:'1px dashed #bbf7d0', paddingTop:'20px' }}>
                <button 
                    onClick={() => setMySubmission(null)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize:'0.9rem', textDecoration:'underline' }}
                >
                    Edit pengumpulan (Kirim Ulang)
                </button>
              </div>
          )}
        </div>
      ) : (
        // 2. JIKA BELUM MENGUMPULKAN
        <>
            {isOverdue ? (
                // 2A. JIKA SUDAH TELAT (Form Hilang)
                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fef2f2', borderRadius: '16px', border: '1px solid #fecaca' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔒</div>
                    <h3 style={{ color: '#991b1b', margin: '0 0 10px 0' }}>Waktu Pengumpulan Habis</h3>
                    <p style={{ color: '#b91c1c' }}>Maaf, Anda tidak dapat mengirim tugas ini karena sudah melewati batas waktu deadline.</p>
                </div>
            ) : (
                // 2B. JIKA MASIH BISA KIRIM (Form Muncul)
                <div style={{ animation: 'fadeIn 0.5s' }}>
                    <h3 style={{ marginBottom: '20px', color: '#334155' }}>📤 Upload Jawaban Anda</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        {/* Box Upload File */}
                        <div style={{ padding: '20px', border: '2px dashed #cbd5e1', borderRadius: '12px', backgroundColor: '#f8fafc', transition: '0.2s' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#475569' }}>
                                📁 File Tugas (PDF/Word/Gambar)
                            </label>
                            <input 
                                type="file" 
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                                style={{ width: '100%' }}
                            />
                            {selectedFile && <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#16a34a', fontWeight: '500' }}>✓ Siap upload: {selectedFile.name}</div>}
                        </div>

                        {/* Box Link */}
                        <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#fff' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#475569' }}>
                                🔗 Atau lampirkan Link (Google Drive / GitHub)
                            </label>
                            <input 
                                type="url" 
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://..."
                                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            style={{ 
                                padding: '16px', 
                                backgroundColor: isSubmitting ? '#94a3b8' : '#2563eb', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '10px', 
                                fontWeight: 'bold', 
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                fontSize: '1rem',
                                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                                transition: '0.2s'
                            }}
                        >
                            {isSubmitting ? '⏳ Sedang Mengirim...' : 'Kirim Tugas Sekarang'}
                        </button>
                    </form>
                </div>
            )}
        </>
      )}
    </div>
  );
};

export default AssignmentPage;