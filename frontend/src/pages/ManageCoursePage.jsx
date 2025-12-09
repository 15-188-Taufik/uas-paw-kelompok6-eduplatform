import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ManageCoursePage = () => {
  const { id } = useParams(); // Course ID
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Form Pop-up (Sederhana pakai prompt/confirm untuk MVP)
  // Di real app sebaiknya pakai Modal Component
  const [newLessonData, setNewLessonData] = useState({ title: '', video_url: '', content_text: '', is_preview: false });
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [activeModuleId, setActiveModuleId] = useState(null); // Modul mana yang sedang ditambah lesson
  const [showLessonForm, setShowLessonForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const courseRes = await api.get(`/courses/${id}`);
      setCourse(courseRes.data.course);

      const modulesRes = await api.get(`/courses/${id}/modules`);
      const modulesData = modulesRes.data.modules;

      // Fetch detail isi modul (lesson & assignment)
      const detailedModules = await Promise.all(
        modulesData.map(async (mod) => {
            const lessonsRes = await api.get(`/modules/${mod.id}/lessons`);
            const assignsRes = await api.get(`/modules/${mod.id}/assignments`);
            return { 
                ...mod, 
                lessons: lessonsRes.data.lessons,
                assignments: assignsRes.data.assignments || [] 
            };
        })
      );
      setModules(detailedModules);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---

  const handleAddModule = async () => {
    const title = prompt("Masukkan Judul Modul Baru:");
    if (!title) return;

    try {
      await api.post(`/courses/${id}/modules`, { title, sort_order: modules.length + 1 });
      alert("Modul berhasil ditambahkan!");
      fetchData(); // Refresh data
    } catch (err) {
      alert("Gagal menambah modul.");
    }
  };

  const handleAddAssignment = async (moduleId) => {
    const title = prompt("Judul Tugas:");
    if (!title) return;
    const description = prompt("Deskripsi/Soal Tugas:");

    try {
      await api.post(`/modules/${moduleId}/assignments`, { title, description });
      alert("Tugas berhasil ditambahkan!");
      fetchData();
    } catch (err) {
      alert("Gagal menambah tugas.");
    }
  };

  // Persiapan form tambah lesson
  const openAddLesson = (moduleId) => {
      setActiveModuleId(moduleId);
      setNewLessonData({ title: '', video_url: '', content_text: '', is_preview: false });
      setAttachmentFile(null);
      setShowLessonForm(true);
  };

  const submitLesson = async (e) => {
      e.preventDefault();
      try {
          const formData = new FormData();
          formData.append('title', newLessonData.title);
          formData.append('video_url', newLessonData.video_url);
          formData.append('content_text', newLessonData.content_text);
          formData.append('is_preview', newLessonData.is_preview);
          
          if (attachmentFile) {
              formData.append('attachment_file', attachmentFile);
          }

          await api.post(`/modules/${activeModuleId}/lessons`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });

          alert("Materi berhasil ditambahkan!");
          setShowLessonForm(false);
          fetchData();
      } catch (err) {
          console.error(err);
          alert("Gagal upload materi.");
      }
  };

  if (loading) return <p style={{textAlign:'center'}}>Loading...</p>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        <div>
            <h2 style={{ margin: 0, color: '#bc2131' }}>Kelola: {course.title}</h2>
            <p style={{ margin: '5px 0 0', color: '#666' }}>ID: {course.id} | Key: {course.is_locked ? 'Terkunci' : 'Publik'}</p>
        </div>
        <button onClick={handleAddModule} style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Tambah Modul
        </button>
      </div>

      {/* List Modul */}
      {modules.map((mod) => (
        <div key={mod.id} style={{ border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{mod.title}</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => openAddLesson(mod.id)} style={{ fontSize: '0.8rem', padding: '5px 10px', cursor: 'pointer' }}>+ Materi</button>
                    <button onClick={() => handleAddAssignment(mod.id)} style={{ fontSize: '0.8rem', padding: '5px 10px', cursor: 'pointer' }}>+ Tugas</button>
                </div>
            </div>

            <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                {/* Lessons */}
                {mod.lessons.map(les => (
                    <li key={les.id} style={{ padding: '10px 15px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '10px' }}>📄</span> 
                        {les.title} 
                        {les.is_preview && <span style={{ marginLeft:'10px', fontSize:'0.7rem', background:'#eee', padding:'2px 5px' }}>Preview</span>}
                    </li>
                ))}
                
                {/* Assignments */}
                {mod.assignments.map(ass => (
                    <li key={ass.id} style={{ padding: '10px 15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#d9534f' }}>
                        <div>
                            <span style={{ marginRight: '10px' }}>📝</span> 
                            {ass.title}
                        </div>
                        
                        {/* Tombol Menuju Halaman Grading */}
                        <button 
                            onClick={() => navigate(`/grading/${ass.id}`)}
                            style={{ 
                                padding: '5px 10px', 
                                backgroundColor: 'white', 
                                border: '1px solid #bc2131', 
                                color: '#bc2131', 
                                borderRadius: '4px', 
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                            }}
                        >
                            Lihat Submission
                        </button>
                    </li>
                ))}

                {mod.lessons.length === 0 && mod.assignments.length === 0 && (
                    <li style={{ padding: '15px', fontStyle: 'italic', color: '#999' }}>Belum ada konten.</li>
                )}
            </ul>
        </div>
      ))}

      {/* Modal / Form Tambah Lesson */}
      {showLessonForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
                  <h3>Tambah Materi Baru</h3>
                  <form onSubmit={submitLesson} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input 
                        type="text" placeholder="Judul Materi" required
                        value={newLessonData.title} 
                        onChange={e => setNewLessonData({...newLessonData, title: e.target.value})}
                        style={{ padding: '8px' }}
                      />
                      <textarea 
                        rows="3" placeholder="Isi Teks Materi..."
                        value={newLessonData.content_text} 
                        onChange={e => setNewLessonData({...newLessonData, content_text: e.target.value})}
                        style={{ padding: '8px' }}
                      />
                      <input 
                        type="text" placeholder="Link Video Youtube (Optional)" 
                        value={newLessonData.video_url} 
                        onChange={e => setNewLessonData({...newLessonData, video_url: e.target.value})}
                        style={{ padding: '8px' }}
                      />
                      <div>
                          <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>Upload File (PDF/PPT):</label>
                          <input type="file" onChange={e => setAttachmentFile(e.target.files[0])} />
                      </div>
                      <label style={{ fontSize: '0.9rem' }}>
                          <input 
                            type="checkbox" 
                            checked={newLessonData.is_preview}
                            onChange={e => setNewLessonData({...newLessonData, is_preview: e.target.checked})}
                          /> Set sebagai Preview (Gratis)
                      </label>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <button type="button" onClick={() => setShowLessonForm(false)} style={{ flex: 1, padding: '10px' }}>Batal</button>
                          <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none' }}>Simpan</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
};

export default ManageCoursePage;