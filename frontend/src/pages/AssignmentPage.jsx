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
        const assignRes = await api.get(`/api/assignments/${id}`);
        setAssignment(assignRes.data.assignment);

        // Ambil info submission user (kalau sudah login)
        if (user) {
            const subRes = await api.get(`/api/assignments/${id}/my_submission`, {
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FAFBFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border" style={{ color: '#FF7E3E', width: '3.5rem', height: '3.5rem', borderWidth: '4px' }} role="status"></div>
          <div style={{ marginTop: '24px', color: '#475569', fontSize: '1rem', fontWeight: '600', letterSpacing: '-0.01em' }}>Memuat data tugas...</div>
        </div>
      </div>
    );
  }
  
  if (!assignment) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FAFBFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <div style={{ 
            width: '120px', 
            height: '120px', 
            margin: '0 auto 24px',
            background: 'linear-gradient(135deg, #FEE2E2, #FECACA)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.15)'
          }}>📚</div>
          <h3 style={{ color: '#DC2626', marginBottom: '12px', fontSize: '1.5rem', fontWeight: '700' }}>Tugas Tidak Ditemukan</h3>
          <p style={{ color: '#64748B', fontSize: '1rem', maxWidth: '400px', margin: '0 auto' }}>Tugas yang Anda cari tidak tersedia atau telah dihapus</p>
        </div>
      </div>
    );
  }

  // --- LOGIKA DEADLINE ---
  const deadlineDate = assignment.due_date ? new Date(assignment.due_date) : null;
  const now = new Date();
  
  // Cek apakah telat (Hanya jika ada deadline)
  const isOverdue = deadlineDate && now > deadlineDate;

  // Format Tanggal (Contoh: Selasa, 2 Desember 2025 pukul 06.59)
  const formattedDeadline = deadlineDate 
    ? (() => {
        const options = { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        };
        const timeOptions = { 
          hour: '2-digit', 
          minute: '2-digit' 
        };
        const dateStr = deadlineDate.toLocaleDateString('id-ID', options);
        const timeStr = deadlineDate.toLocaleTimeString('id-ID', timeOptions);
        return `${dateStr} pukul ${timeStr}`;
      })()
    : null;

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#FAFBFC',
      backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255, 126, 62, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(249, 115, 22, 0.02) 0%, transparent 50%)',
      padding: '48px 24px 80px', 
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Tombol Kembali */}
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            background: '#FFFFFF', 
            border: '1px solid #E5E7EB', 
            color: '#6B7280', 
            cursor: 'pointer', 
            fontSize: '0.95rem',
            fontWeight: '600',
            marginBottom: '32px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F9FAFB';
            e.currentTarget.style.borderColor = '#D1D5DB';
            e.currentTarget.style.color = '#111827';
            e.currentTarget.style.transform = 'translateX(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.borderColor = '#E5E7EB';
            e.currentTarget.style.color = '#6B7280';
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
          }}
        >
          <i className="bi bi-arrow-left" style={{ fontSize: '1.1rem' }}></i>
          <span>Kembali ke Materi</span>
        </button>

        {/* HEADER TUGAS - Professional Design */}
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: '24px', 
          padding: '48px', 
          marginBottom: '28px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03), 0 20px 60px rgba(0, 0, 0, 0.04)',
          border: '1px solid #E5E7EB',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative gradient */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #FF7E3E, #F97316, #EA580C)',
            opacity: 0.8
          }}></div>
          
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ 
              margin: '0 0 20px 0', 
              fontSize: '2.5rem', 
              fontWeight: '800',
              color: '#111827',
              lineHeight: '1.1',
              letterSpacing: '-0.02em'
            }}>
              {assignment.title}
            </h1>
            
            {/* Badge Deadline - Premium */}
            {formattedDeadline && (
              <div style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: isOverdue 
                  ? 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)' 
                  : 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                color: isOverdue ? '#991B1B' : '#92400E',
                padding: '12px 24px', 
                borderRadius: '100px',
                fontSize: '0.95rem',
                fontWeight: '700',
                border: isOverdue ? '2px solid #FCA5A5' : '2px solid #FCD34D',
                boxShadow: isOverdue 
                  ? '0 4px 16px rgba(220, 38, 38, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)' 
                  : '0 4px 16px rgba(217, 119, 6, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                letterSpacing: '-0.01em'
              }}>
                <span style={{ fontSize: '1.2rem' }}>{isOverdue ? '⚠️' : '🕒'}</span>
                <span>
                  <span style={{ opacity: 0.8, marginRight: '6px' }}>{isOverdue ? 'Terlambat' : 'Deadline'}</span>
                  {formattedDeadline}
                </span>
              </div>
            )}
          </div>
          
          <div style={{ 
            fontSize: '1.05rem', 
            color: '#4B5563', 
            lineHeight: '1.9', 
            whiteSpace: 'pre-wrap',
            paddingTop: '24px',
            borderTop: '2px solid #F3F4F6',
            fontWeight: '400'
          }}>
            {assignment.description}
          </div>
          
          {/* Format pengumpulan hint - Premium */}
          {assignment.description && assignment.description.includes('format') && (
            <div style={{
              marginTop: '28px',
              padding: '20px 24px',
              background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
              borderLeft: '5px solid #FF7E3E',
              borderRadius: '12px',
              fontSize: '0.95rem',
              color: '#7C2D12',
              boxShadow: '0 2px 8px rgba(255, 126, 62, 0.08)'
            }}>
              <div style={{ 
                fontWeight: '700', 
                marginBottom: '8px', 
                color: '#9A3412',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '1.3rem' }}>💡</span>
                <span>Catatan Penting</span>
              </div>
              <div style={{ lineHeight: '1.6', fontWeight: '500' }}>Pastikan format file sesuai dengan ketentuan yang telah diberikan</div>
            </div>
          )}
        </div>

        {/* AREA PENGUMPULAN */}
        {mySubmission ? (
          // 1. JIKA SUDAH MENGUMPULKAN - Enhanced Design
          <div style={{ 
            backgroundColor: '#F0FDF4', 
            border: '2px solid #86EFAC', 
            borderRadius: '20px', 
            padding: '40px',
            boxShadow: '0 4px 20px rgba(34, 197, 94, 0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '30px',
              paddingBottom: '20px',
              borderBottom: '1px solid #BBF7D0'
            }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: '#22C55E',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                ✅
              </div>
              <h3 style={{ 
                margin: 0, 
                color: '#15803D', 
                fontSize: '1.5rem',
                fontWeight: '700'
              }}>
                Tugas Berhasil Dikumpulkan
              </h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Waktu Kirim */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '180px 1fr', 
                gap: '16px',
                alignItems: 'start'
              }}>
                <div style={{ 
                  color: '#166534', 
                  fontWeight: '600',
                  fontSize: '0.95rem'
                }}>
                  📅 Waktu Pengumpulan
                </div>
                <div style={{ 
                  fontWeight: '600',
                  color: '#0F172A',
                  fontSize: '1rem'
                }}>
                  {new Date(mySubmission.submitted_at).toLocaleString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {/* File Lampiran */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '180px 1fr', 
                gap: '16px',
                alignItems: 'start'
              }}>
                <div style={{ 
                  color: '#166534', 
                  fontWeight: '600',
                  fontSize: '0.95rem'
                }}>
                  📎 File Lampiran
                </div>
                <div>
                  {mySubmission.file_url ? (
                    <a 
                      href={mySubmission.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        backgroundColor: '#FFFFFF',
                        color: '#2563EB', 
                        textDecoration: 'none', 
                        fontWeight: '600',
                        borderRadius: '10px',
                        border: '1.5px solid #BFDBFE',
                        transition: 'all 0.2s ease',
                        fontSize: '0.95rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#EFF6FF';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <i className="bi bi-file-earmark-arrow-down"></i>
                      <span>Lihat File yang Dikumpulkan</span>
                    </a>
                  ) : (
                    <span style={{ color: '#64748B', fontStyle: 'italic' }}>Tidak ada file</span>
                  )}
                </div>
              </div>

              {/* Link / Catatan */}
              {mySubmission.text && (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '180px 1fr', 
                  gap: '16px',
                  alignItems: 'start'
                }}>
                  <div style={{ 
                    color: '#166534', 
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>
                    🔗 Link Tambahan
                  </div>
                  <div>
                    <a 
                      href={mySubmission.text} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ 
                        color: '#2563EB',
                        textDecoration: 'none',
                        wordBreak: 'break-all',
                        fontWeight: '500'
                      }}
                    >
                      {mySubmission.text}
                    </a>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: '#BBF7D0', margin: '10px 0' }}></div>

              {/* Nilai */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '180px 1fr', 
                gap: '16px',
                alignItems: 'center'
              }}>
                <div style={{ 
                  color: '#166534', 
                  fontWeight: '600',
                  fontSize: '0.95rem'
                }}>
                  ⭐ Nilai
                </div>
                <div>
                  {mySubmission.grade !== null ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ 
                        fontSize: '2.5rem', 
                        fontWeight: '800', 
                        color: '#15803D',
                        lineHeight: '1'
                      }}>
                        {mySubmission.grade}
                      </span>
                      <span style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: '500', 
                        color: '#64748B'
                      }}>
                        / 100
                      </span>
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '12px 16px',
                      backgroundColor: '#FEF3C7',
                      color: '#92400E',
                      borderRadius: '10px',
                      border: '1px solid #FCD34D',
                      fontWeight: '500',
                      fontSize: '0.9rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <i className="bi bi-clock-history"></i>
                      <span>Menunggu penilaian dari instruktur...</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Feedback */}
              {mySubmission.feedback && (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '180px 1fr', 
                  gap: '16px',
                  alignItems: 'start'
                }}>
                  <div style={{ 
                    color: '#166534', 
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>
                    💬 Feedback Instruktur
                  </div>
                  <div style={{ 
                    backgroundColor: '#FFFFFF', 
                    padding: '16px 20px', 
                    borderRadius: '12px', 
                    border: '1.5px solid #D1FAE5',
                    color: '#0F172A',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    fontStyle: 'italic',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                  }}>
                    "{mySubmission.feedback}"
                  </div>
                </div>
              )}
            </div>

            {/* Edit Button */}
            {!isOverdue && (
              <div style={{ 
                marginTop: '30px', 
                paddingTop: '24px',
                borderTop: '1px dashed #BBF7D0'
              }}>
                <button 
                  onClick={() => setMySubmission(null)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#64748B', 
                    cursor: 'pointer', 
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#0F172A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#64748B';
                  }}
                >
                  <i className="bi bi-pencil-square"></i>
                  <span>Edit Pengumpulan (Kirim Ulang)</span>
                </button>
              </div>
            )}
          </div>
        ) : (
        // 2. JIKA BELUM MENGUMPULKAN
        <>
            {isOverdue ? (
                // 2A. JIKA SUDAH TELAT (Form Hilang) - Premium Design
                <div style={{ 
                  textAlign: 'center', 
                  padding: '80px 48px', 
                  backgroundColor: '#FFFFFF', 
                  borderRadius: '24px', 
                  border: '2px solid #FCA5A5',
                  boxShadow: '0 4px 24px rgba(239, 68, 68, 0.12), 0 2px 8px rgba(239, 68, 68, 0.06)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Decorative elements */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '6px',
                    background: 'linear-gradient(90deg, #FCA5A5, #F87171, #DC2626)'
                  }}></div>
                  
                  <div style={{ 
                    width: '140px', 
                    height: '140px',
                    margin: '0 auto 32px',
                    background: 'linear-gradient(135deg, #FEE2E2, #FECACA)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '5rem',
                    border: '6px solid #FCA5A5',
                    boxShadow: '0 8px 32px rgba(220, 38, 38, 0.2), inset 0 2px 8px rgba(255, 255, 255, 0.5)',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      inset: '-8px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, transparent, rgba(252, 165, 165, 0.3))',
                      animation: 'pulse 2s ease-in-out infinite'
                    }}></div>
                    🔒
                  </div>
                  
                  <h2 style={{ 
                    color: '#991B1B', 
                    margin: '0 0 16px 0',
                    fontSize: '2rem',
                    fontWeight: '800',
                    letterSpacing: '-0.02em'
                  }}>
                    Waktu Pengumpulan Habis
                  </h2>
                  
                  <p style={{ 
                    color: '#DC2626', 
                    fontSize: '1.05rem',
                    lineHeight: '1.7',
                    maxWidth: '560px',
                    margin: '0 auto 32px',
                    fontWeight: '500'
                  }}>
                    Maaf, Anda tidak dapat mengirim tugas ini karena sudah melewati batas waktu deadline.
                  </p>
                  
                  {formattedDeadline && (
                    <div style={{
                      padding: '20px 32px',
                      background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)',
                      borderRadius: '16px',
                      display: 'inline-block',
                      border: '2px solid #FECACA',
                      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)'
                    }}>
                      <div style={{ 
                        color: '#7F1D1D', 
                        fontSize: '0.85rem', 
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '6px'
                      }}>
                        Deadline Berakhir Pada
                      </div>
                      <div style={{ 
                        color: '#991B1B', 
                        fontSize: '1.15rem', 
                        fontWeight: '800',
                        letterSpacing: '-0.01em'
                      }}>
                        {formattedDeadline}
                      </div>
                    </div>
                  )}
                </div>
            ) : (
                // 2B. JIKA MASIH BISA KIRIM (Form Muncul) - Premium Design
                <div style={{ 
                  backgroundColor: '#FFFFFF',
                  borderRadius: '24px',
                  padding: '48px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03), 0 20px 60px rgba(0, 0, 0, 0.04)',
                  border: '1px solid #E5E7EB'
                }}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    marginBottom: '36px',
                    paddingBottom: '24px',
                    borderBottom: '2px solid #F3F4F6'
                  }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      background: 'linear-gradient(135deg, #FFEDD5, #FED7AA)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.75rem',
                      boxShadow: '0 4px 12px rgba(255, 126, 62, 0.15)'
                    }}>
                      📤
                    </div>
                    <h3 style={{ 
                      margin: 0, 
                      color: '#111827',
                      fontSize: '1.75rem',
                      fontWeight: '800',
                      letterSpacing: '-0.02em'
                    }}>
                      Upload Jawaban Anda
                    </h3>
                  </div>
                  
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    
                    {/* Box Upload File - Premium */}
                    <div style={{ 
                      padding: '32px', 
                      border: '2px dashed #D1D5DB', 
                      borderRadius: '20px', 
                      background: 'linear-gradient(135deg, #F9FAFB, #F3F4F6)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative'
                    }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = '#FF7E3E';
                        e.currentTarget.style.background = 'linear-gradient(135deg, #FFF7ED, #FFEDD5)';
                        e.currentTarget.style.boxShadow = '0 0 0 4px rgba(255, 126, 62, 0.1)';
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.style.borderColor = '#D1D5DB';
                        e.currentTarget.style.background = 'linear-gradient(135deg, #F9FAFB, #F3F4F6)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <label style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '16px', 
                        fontWeight: '800', 
                        color: '#1F2937',
                        fontSize: '1.1rem',
                        letterSpacing: '-0.01em'
                      }}>
                        <span style={{ fontSize: '1.5rem' }}>📁</span>
                        <span>File Tugas</span>
                      </label>
                      
                      <div style={{ 
                        marginBottom: '16px', 
                        color: '#6B7280', 
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        lineHeight: '1.6'
                      }}>
                        Format yang diterima: <strong>PDF, Word, ZIP, Gambar (PNG, JPG)</strong>
                      </div>
                      
                      <input 
                        type="file" 
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                        style={{ 
                          width: '100%',
                          padding: '14px 16px',
                          border: '2px solid #E5E7EB',
                          borderRadius: '12px',
                          backgroundColor: '#FFFFFF',
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                      />
                      
                      {selectedFile && (
                        <div style={{ 
                          marginTop: '20px', 
                          padding: '16px 20px',
                          background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
                          border: '2px solid #86EFAC',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          fontSize: '0.95rem',
                          color: '#15803D',
                          fontWeight: '700',
                          boxShadow: '0 2px 8px rgba(34, 197, 94, 0.1)'
                        }}>
                          <i className="bi bi-check-circle-fill" style={{ fontSize: '1.3rem' }}></i>
                          <span>File siap diupload: {selectedFile.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Divider dengan "ATAU" - Premium */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '20px',
                      margin: '8px 0'
                    }}>
                      <div style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg, transparent, #E5E7EB, transparent)' }}></div>
                      <span style={{ 
                        color: '#9CA3AF', 
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        letterSpacing: '0.1em',
                        padding: '6px 16px',
                        backgroundColor: '#F9FAFB',
                        borderRadius: '24px',
                        border: '2px solid #E5E7EB'
                      }}>
                        ATAU
                      </span>
                      <div style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg, transparent, #E5E7EB, transparent)' }}></div>
                    </div>

                    {/* Box Link - Premium */}
                    <div style={{ 
                      padding: '32px', 
                      border: '2px solid #E5E7EB', 
                      borderRadius: '20px', 
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
                    }}>
                      <label style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '16px', 
                        fontWeight: '800', 
                        color: '#1F2937',
                        fontSize: '1.1rem',
                        letterSpacing: '-0.01em'
                      }}>
                        <span style={{ fontSize: '1.5rem' }}>🔗</span>
                        <span>Link Eksternal</span>
                      </label>
                      
                      <div style={{ 
                        marginBottom: '16px', 
                        color: '#6B7280', 
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        lineHeight: '1.6'
                      }}>
                        Lampirkan link dari <strong>Google Drive, GitHub,</strong> atau platform lainnya
                      </div>
                      
                      <input 
                        type="url" 
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        style={{ 
                          width: '100%', 
                          padding: '16px 18px', 
                          border: '2px solid #D1D5DB', 
                          borderRadius: '12px',
                          fontSize: '0.95rem',
                          fontWeight: '500',
                          outline: 'none',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          backgroundColor: '#F9FAFB',
                          color: '#111827'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#FF7E3E';
                          e.target.style.backgroundColor = '#FFFFFF';
                          e.target.style.boxShadow = '0 0 0 4px rgba(255, 126, 62, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#D1D5DB';
                          e.target.style.backgroundColor = '#F9FAFB';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Submit Button - Premium */}
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      style={{ 
                        padding: '20px 36px', 
                        background: isSubmitting 
                          ? 'linear-gradient(135deg, #9CA3AF, #6B7280)' 
                          : 'linear-gradient(135deg, #FF7E3E, #F97316)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '14px', 
                        fontWeight: '800', 
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontSize: '1.05rem',
                        boxShadow: isSubmitting 
                          ? 'none' 
                          : '0 4px 20px rgba(255, 126, 62, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        marginTop: '20px',
                        letterSpacing: '-0.01em',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSubmitting) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #F97316, #EA580C)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 28px rgba(255, 126, 62, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSubmitting) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #FF7E3E, #F97316)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 126, 62, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                        }
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="spinner-border spinner-border-sm" role="status" style={{ borderWidth: '3px' }}></div>
                          <span>Sedang Mengirim...</span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send-fill" style={{ fontSize: '1.1rem' }}></i>
                          <span>Kirim Tugas Sekarang</span>
                        </>
                      )}
                    </button>
                    
                    {/* Info Helper - Premium */}
                    <div style={{
                      padding: '20px 24px',
                      background: 'linear-gradient(135deg, #F9FAFB, #F3F4F6)',
                      borderRadius: '16px',
                      border: '2px solid #E5E7EB',
                      fontSize: '0.9rem',
                      color: '#4B5563',
                      lineHeight: '1.7',
                      display: 'flex',
                      gap: '14px',
                      fontWeight: '500'
                    }}>
                      <i className="bi bi-info-circle-fill" style={{ color: '#FF7E3E', fontSize: '1.3rem', marginTop: '2px' }}></i>
                      <div>
                        <strong style={{ color: '#1F2937', display: 'block', marginBottom: '4px' }}>Catatan:</strong>
                        Pastikan file atau link yang Anda upload sudah benar. Anda masih bisa mengedit pengumpulan sebelum deadline berakhir.
                      </div>
                    </div>
                  </form>
                </div>
            )}
        </>
        )}
      </div>
    </div>
  );
};

export default AssignmentPage;