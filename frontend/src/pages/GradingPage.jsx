import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const GradingPage = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [loading, setLoading] = useState(true);

  // State untuk input nilai & feedback sementara
  const [inputs, setInputs] = useState({});

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  const fetchSubmissions = async () => {
    try {
      const res = await api.get(`/api/assignments/${assignmentId}/submissions`);
      setSubmissions(res.data.submissions);
      
      // Judul assignment biasanya ada di res.data.assignment_title atau diambil terpisah
      // Jika backend tidak mengirim title di endpoint ini, biarkan string kosong atau fetch detail assignment
      if (res.data.assignment_title) {
          setAssignmentTitle(res.data.assignment_title);
      }

      // Siapkan state lokal untuk input form
      const initialInputs = {};
      res.data.submissions.forEach(sub => {
        // [PERBAIKAN] Gunakan sub.id (bukan sub.submission_id) sesuai backend
        initialInputs[sub.id] = {
          grade: sub.grade !== null ? sub.grade : '',
          feedback: sub.feedback || ''
        };
      });
      setInputs(initialInputs);
    } catch (err) {
      console.error("Gagal ambil submission:", err);
      alert("Gagal memuat data submission.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (subId, field, value) => {
    setInputs(prev => ({
      ...prev,
      [subId]: {
        ...prev[subId],
        [field]: value
      }
    }));
  };

  const handleSave = async (subId) => {
    const data = inputs[subId];
    
    // Validasi sederhana
    if (data.grade === '' || data.grade === null) {
      alert("Harap isi nilai terlebih dahulu.");
      return;
    }

    try {
      // Endpoint Pyramid: POST /api/submissions/{id}/grade
      await api.post(`/submissions/${subId}/grade`, {
        grade: parseFloat(data.grade),
        feedback: data.feedback
      });
      alert("Nilai berhasil disimpan! ✅");
      
      // Refresh data agar status 'Dinilai' terupdate dari server
      fetchSubmissions(); 
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan nilai.");
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading Data...</p>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ marginBottom: '20px', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
      >
        ← Kembali ke Manajemen Kursus
      </button>

      <h2 style={{ color: '#bc2131', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        Penilaian Submission
      </h2>

      {submissions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <p>Belum ada mahasiswa yang mengumpulkan tugas ini.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Mahasiswa</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Waktu Submit</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>File / Jawaban</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', width: '100px' }}>Nilai (0-100)</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Feedback</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', width: '100px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                // [PERBAIKAN] Gunakan sub.id sebagai key
                <tr key={sub.id} style={{ borderBottom: '1px solid #eee' }}>
                  
                  {/* Info Mahasiswa */}
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <strong>{sub.student_name}</strong>
                  </td>

                  {/* Waktu */}
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : '-'}
                  </td>

                  {/* File / Link */}
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {sub.file_url ? (
                      <a 
                        href={sub.file_url} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ display: 'inline-block', padding: '5px 10px', backgroundColor: '#e3f2fd', color: '#0d47a1', borderRadius: '4px', textDecoration: 'none', fontSize: '0.9rem' }}
                      >
                        📄 Buka File
                      </a>
                    ) : (
                      <span style={{ color: '#999', fontSize: '0.8rem' }}>Tidak ada file</span>
                    )}
                    
                    {/* [PERBAIKAN] Backend mengirim 'text', bukan 'text_content' */}
                    {sub.text && (
                        <div style={{ marginTop: '5px', fontSize: '0.9rem' }}>
                          <strong>Teks/Link:</strong> <br/>
                          <a href={sub.text} target="_blank" rel="noreferrer" style={{color: '#bc2131'}}>
                            {sub.text}
                          </a>
                        </div>
                    )}
                  </td>

                  {/* Input Nilai */}
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <input 
                      type="number"
                      // [PERBAIKAN] Akses inputs menggunakan sub.id
                      value={inputs[sub.id]?.grade || ''}
                      onChange={(e) => handleInputChange(sub.id, 'grade', e.target.value)}
                      style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                  </td>

                  {/* Input Feedback */}
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <textarea 
                      // [PERBAIKAN] Akses inputs menggunakan sub.id
                      value={inputs[sub.id]?.feedback || ''}
                      onChange={(e) => handleInputChange(sub.id, 'feedback', e.target.value)}
                      placeholder="Tulis masukan..."
                      rows="2"
                      style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                  </td>

                  {/* Tombol Simpan */}
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <button 
                      // [PERBAIKAN] Pass sub.id ke fungsi save
                      onClick={() => handleSave(sub.id)}
                      style={{ 
                        padding: '8px 15px', 
                        backgroundColor: '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Simpan
                    </button>
                    {sub.grade !== null && (
                        <div style={{ marginTop: '5px', fontSize: '0.8rem', color: 'green' }}>
                            ✓ Tersimpan
                        </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GradingPage;