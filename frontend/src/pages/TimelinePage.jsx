import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const TimelinePage = () => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Tema Warna
  const colors = {
    primary: '#FF7E3E',
    background: '#FDF8F4',
    white: '#FFFFFF',
    textDark: '#2D2D2D',
    textLight: '#7A7A7A',
    border: '#EAEAEA',
    cardShadow: '0 10px 30px rgba(0,0,0,0.04)',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444'
  };

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchTimeline = async () => {
      try {
        // Fetch courses untuk student
        const response = await api.get(`/students/${user.id}/courses`);
        const courses = response.data.courses;

        // Filter dan urutkan berdasarkan deadline terdekat
        const timelineData = courses
          .filter(course => course.deadline) // Hanya courses dengan deadline
          .map(course => {
            const deadlineDate = new Date(course.deadline);
            const today = new Date();
            const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
            
            return {
              id: course.id,
              title: course.title,
              thumbnail_url: course.thumbnail_url,
              deadline: course.deadline,
              deadlineDate,
              daysLeft,
              category: course.category,
              instructor_name: course.instructor_name,
              progress: course.progress || 0,
              status: daysLeft < 0 ? 'overdue' : daysLeft <= 3 ? 'urgent' : 'upcoming'
            };
          })
          .sort((a, b) => a.deadlineDate - b.deadlineDate);

        setTimeline(timelineData);
      } catch (err) {
        console.error("Gagal mengambil timeline:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [navigate, user]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'overdue':
        return colors.danger;
      case 'urgent':
        return colors.warning;
      case 'upcoming':
        return colors.success;
      default:
        return colors.primary;
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'overdue':
        return 'Terlambat';
      case 'urgent':
        return 'Segera';
      case 'upcoming':
        return 'Akan Datang';
      default:
        return 'Status';
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <p style={{ color: colors.primary, fontWeight: '600', fontFamily: 'Poppins' }}>Sedang memuat timeline...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: colors.background, 
      minHeight: '100vh', 
      padding: '40px 20px',
      fontFamily: "'Poppins', sans-serif"
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: '800', 
            color: colors.textDark, 
            marginBottom: '10px' 
          }}>
            Timeline Deadline
          </h2>
          <p style={{ color: colors.textLight }}>
            Pantau deadline terdekat dari setiap course yang sedang Anda ikuti
          </p>
        </div>

        {timeline.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 40px', 
            backgroundColor: colors.white, 
            borderRadius: '24px',
            border: `1px solid ${colors.border}`
          }}>
            <div style={{ marginBottom: '20px' }}>
              <i className="bi bi-calendar-check" style={{ fontSize: '48px', color: colors.textLight }}></i>
            </div>
            <h4 style={{ color: colors.textDark, fontWeight: '700', marginBottom: '10px' }}>
              Tidak ada deadline yang akan datang
            </h4>
            <p style={{ color: colors.textLight }}>
              Semua tugas Anda sudah terpenuhi atau belum ada deadline yang ditentukan
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {timeline.map((item, index) => {
              const statusColor = getStatusColor(item.status);
              const isOverdue = item.status === 'overdue';

              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: '16px',
                    border: `2px solid ${statusColor}`,
                    overflow: 'hidden',
                    boxShadow: colors.cardShadow,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '20px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(5px)';
                    e.currentTarget.style.boxShadow = `0 15px 35px rgba(${statusColor === colors.danger ? '239, 68, 68' : statusColor === colors.warning ? '245, 158, 11' : '16, 185, 129'}, 0.15)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = colors.cardShadow;
                  }}
                  onClick={() => navigate(`/course/${item.id}`)}
                >
                  {/* Timeline Indicator (Left) */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: statusColor,
                      boxShadow: `0 0 0 6px rgba(${statusColor === colors.danger ? '239, 68, 68' : statusColor === colors.warning ? '245, 158, 11' : '16, 185, 129'}, 0.1)`,
                      marginBottom: index !== timeline.length - 1 ? '16px' : 0
                    }}></div>
                    {index !== timeline.length - 1 && (
                      <div style={{
                        width: '2px',
                        height: '60px',
                        backgroundColor: statusColor,
                        opacity: 0.3
                      }}></div>
                    )}
                  </div>

                  {/* Content (Middle) */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h4 style={{ 
                        margin: 0, 
                        fontSize: '16px', 
                        fontWeight: '700', 
                        color: colors.textDark 
                      }}>
                        {item.title}
                      </h4>
                      <span style={{
                        backgroundColor: statusColor,
                        color: colors.white,
                        padding: '4px 12px',
                        borderRadius: '50px',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                    
                    <p style={{ 
                      margin: '8px 0', 
                      color: colors.textLight, 
                      fontSize: '13px' 
                    }}>
                      <i className="bi bi-calendar-event me-2" style={{ color: statusColor }}></i>
                      {formatDate(item.deadlineDate)}
                    </p>

                    {item.instructor_name && (
                      <p style={{ 
                        margin: '4px 0', 
                        color: colors.textLight, 
                        fontSize: '13px' 
                      }}>
                        <i className="bi bi-person-circle me-2"></i>
                        {item.instructor_name}
                      </p>
                    )}

                    {/* Progress Bar */}
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <small style={{ color: colors.textLight, fontWeight: '600' }}>Progress Kursus</small>
                        <small style={{ color: colors.primary, fontWeight: '700' }}>{Math.round(item.progress)}%</small>
                      </div>
                      <div style={{ width: '100%', height: '6px', borderRadius: '3px', backgroundColor: '#e9ecef', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${item.progress}%`, 
                            height: '100%', 
                            backgroundColor: colors.primary,
                            transition: 'width 0.3s ease'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Days Left (Right) */}
                  <div style={{ textAlign: 'center', minWidth: '80px' }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '800',
                      color: statusColor,
                      lineHeight: 1
                    }}>
                      {isOverdue ? Math.abs(item.daysLeft) : item.daysLeft}
                    </div>
                    <p style={{ 
                      margin: '4px 0 0 0', 
                      fontSize: '12px', 
                      color: colors.textLight,
                      fontWeight: '600'
                    }}>
                      {isOverdue ? 'hari lalu' : 'hari lagi'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelinePage;
