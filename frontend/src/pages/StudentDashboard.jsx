import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredStat, setHoveredStat] = useState(null);
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [showAllCourses, setShowAllCourses] = useState(false);

  const navigate = useNavigate();
  
  // --- CONFIG THEME ---
  const theme = {
    primary: '#FF7E3E',       // Oranye Utama
    primarySoft: '#FFF0E6',   // Oranye Sangat Muda
    bg: '#FDF8F4',            // Krem Latar Belakang
    white: '#FFFFFF',
    textMain: '#2D2D2D',
    textSec: '#757575',
    textMuted: '#9CA3AF',
    border: '#F0F0F0',
    shadow: '0 10px 30px rgba(255, 126, 62, 0.08)',
    shadowHeavy: '0 20px 40px rgba(0,0,0,0.1)'
  };

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/students/${user.id}/courses`);
        setCourses(response.data?.courses || []);
      } catch (err) {
        console.error(err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, user?.id]);

  const totalCourses = courses.length;
  const completedCourses = courses.filter(c => (c.progress || 0) === 100).length;
  const activeCourses = totalCourses - completedCourses;
  const avgProgress = totalCourses > 0 ? Math.round(courses.reduce((sum, c) => sum + (c.progress || 0), 0) / totalCourses) : 0;

  // Kursus yang terakhir diakses atau aktif
  const lastActiveCourse = courses.find(c => (c.progress || 0) > 0 && (c.progress || 0) < 100) || courses[0];
  
  // Kursus yang sedang berlangsung (untuk section Lanjutkan Pembelajaran)
  const continueLearningCourses = courses.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100).slice(0, 3);
  
  // Kursus dengan progress tertinggi
  const topCourses = [...courses].sort((a, b) => (b.progress || 0) - (a.progress || 0)).slice(0, 3);

  const todayText = useMemo(() => {
    return new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  const getProgressColor = (progress) => {
    if (progress >= 75) return '#10B981';
    if (progress >= 50) return '#F59E0B';
    if (progress >= 25) return '#6366F1';
    return '#EF4444';
  };

  const getProgressEmoji = (progress) => {
    if (progress === 100) return '🎉';
    if (progress >= 75) return '🚀';
    if (progress >= 50) return '📚';
    if (progress >= 25) return '🌱';
    return '👀';
  };

  // Calculate learning insights
  const learningStreak = courses.filter(c => (c.progress || 0) > 0).length;
  const recommendedCourse = courses.find(c => (c.progress || 0) > 0 && (c.progress || 0) < 100) || courses[0];
  const nextMilestone = courses
    .filter(c => (c.progress || 0) < 100)
    .map(c => ({ ...c, nextMilestone: Math.ceil((c.progress || 0) / 25) * 25 }))
    .sort((a, b) => Math.abs(a.nextMilestone - (a.progress || 0)) - Math.abs(b.nextMilestone - (b.progress || 0)))[0];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: theme.bg }}>
        <div className="text-center">
          <div className="spinner-border" style={{ color: theme.primary }} role="status" />
          <div className="mt-3 small" style={{ color: theme.textSec }}>Memuat dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: theme.bg, fontFamily: "'Poppins', sans-serif", paddingBottom: '60px' }}>
      
      {/* Gradient Background Effect */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '300px',
        background: `linear-gradient(135deg, ${theme.bg}, rgba(255, 126, 62, 0.05))`,
        zIndex: -1,
        pointerEvents: 'none'
      }}></div>

      <div className="container" style={{ maxWidth: 1200, paddingTop: '40px' }}>
        
        {/* HEADER SECTION - Enhanced */}
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-4 mb-5">
          <div>
            <h1 style={{ fontWeight: '800', color: theme.textMain, marginBottom: '8px', fontSize: '32px' }}>Dashboard Pembelajaran</h1>
            <div style={{ color: theme.textMuted, fontSize: '15px', lineHeight: 1.6 }}>
              Selamat datang kembali, <span style={{ color: theme.primary, fontWeight: '700' }}>{user?.name || 'Student'}</span> 👋
              <br />
              <span style={{ fontSize: '13px' }}>Terus tingkatkan prestasi belajarmu hari ini</span>
            </div>
          </div>

          {/* Date & Motivation Card */}
          <div
            style={{
              backgroundColor: theme.white,
              borderRadius: '16px',
              padding: '16px 24px',
              boxShadow: theme.shadow,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.3s ease',
              border: `1px solid ${theme.border}`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = theme.shadowHeavy;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = theme.shadow;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: '24px' }}>📅</div>
            <div>
              <div style={{ fontSize: '12px', color: theme.textMuted, fontWeight: '600' }}>Hari Ini</div>
              <div style={{ fontWeight: '600', color: theme.textMain, fontSize: '14px' }}>{todayText}</div>
            </div>
          </div>
        </div>

        {/* STAT CARDS - Enhanced Grid */}
        <div className="row g-4 mb-5">
          <StatCard
            icon="bi-book-fill"
            label="Total Kursus"
            value={totalCourses}
            color={theme.primary}
            bgColor={theme.primarySoft}
            subtitle={`${completedCourses} selesai`}
            hovered={hoveredStat === 'total'}
            onHover={() => setHoveredStat('total')}
            onLeave={() => setHoveredStat(null)}
          />
          <StatCard
            icon="bi-fire"
            label="Sedang Dipelajari"
            value={activeCourses}
            color="#F59E0B"
            bgColor="#FEF3C7"
            subtitle={`${learningStreak} aktif`}
            hovered={hoveredStat === 'active'}
            onHover={() => setHoveredStat('active')}
            onLeave={() => setHoveredStat(null)}
          />
          <StatCard 
            icon="bi-check-circle-fill" 
            label="Selesai" 
            value={completedCourses} 
            color="#10B981"
            bgColor="#D1FAE5"
            subtitle={`${completedCourses > 0 ? '✨' : '🎯'}`}
            hovered={hoveredStat === 'completed'}
            onHover={() => setHoveredStat('completed')}
            onLeave={() => setHoveredStat(null)}
          />
        </div>

        {/* MAIN GRID - Two Columns */}
        <div className="row g-4 mb-5">
          
          {/* LEFT: Continue Learning - Featured */}
          <div className="col-lg-7">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 style={{ fontWeight: '700', color: theme.textMain, margin: 0, fontSize: '18px' }}>
                  <i className="bi bi-lightning-fill" style={{ color: '#F59E0B', marginRight: '8px' }}></i>
                  Lanjutkan Pembelajaran
                </h5>
              </div>
              {continueLearningCourses.length > 0 && (
                <button
                  className="btn btn-sm"
                  style={{ 
                    color: theme.primary, 
                    border: `1px solid ${theme.primary}30`, 
                    backgroundColor: theme.primarySoft,
                    fontSize: '13px',
                    fontWeight: '600',
                    borderRadius: '12px'
                  }}
                  onClick={() => navigate('/')}
                >
                  Lihat semua <i className="bi bi-arrow-right ms-1" />
                </button>
              )}
            </div>

            {continueLearningCourses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Featured Card (First Course) */}
                <div
                  className="card border-0 overflow-hidden"
                  style={{ 
                    borderRadius: '20px', 
                    boxShadow: theme.shadow,
                    transition: 'all 0.3s ease',
                    background: `linear-gradient(135deg, ${theme.white}, ${theme.primarySoft})`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = theme.shadowHeavy;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = theme.shadow;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div className="row g-0">
                    <div className="col-md-5 position-relative overflow-hidden">
                      <img
                        src={continueLearningCourses[0].thumbnail_url || 'https://via.placeholder.com/700x450?text=Course'}
                        alt="Thumbnail"
                        className="w-100 h-100"
                        style={{ objectFit: 'cover', minHeight: 260, transition: 'transform 0.3s ease' }}
                      />
                      {/* Overlay Badge */}
                      <div style={{ 
                        position: 'absolute', 
                        top: '16px', 
                        right: '16px',
                        backgroundColor: theme.white,
                        color: theme.primary,
                        padding: '8px 16px',
                        borderRadius: '50px',
                        fontWeight: '700',
                        fontSize: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}>
                        {continueLearningCourses[0].category || 'AI'}
                      </div>
                    </div>

                    <div className="col-md-7 d-flex flex-column justify-content-between">
                      <div className="p-4">
                        <h3 style={{ fontWeight: '800', color: theme.textMain, marginBottom: '12px', fontSize: '20px', lineHeight: 1.3 }}>
                          {continueLearningCourses[0].title}
                        </h3>
                        
                        <p style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '16px', lineHeight: 1.5 }}>
                          <i className="bi bi-person-circle me-2" style={{ color: theme.primary }}></i>
                          {continueLearningCourses[0].instructor_name || 'Pak Dosen'}
                        </p>

                        {/* Advanced Progress Bar */}
                        <div>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <small style={{ color: theme.textSec, fontWeight: '600', fontSize: '12px' }}>Progress Belajar</small>
                            <small style={{ color: theme.primary, fontWeight: '800', fontSize: '13px' }}>
                              {continueLearningCourses[0].progress || 0}%
                            </small>
                          </div>
                          <div style={{ 
                            height: '10px', 
                            borderRadius: '10px', 
                            backgroundColor: theme.border,
                            overflow: 'hidden',
                            position: 'relative'
                          }}>
                            <div
                              style={{ 
                                width: `${continueLearningCourses[0].progress || 0}%`, 
                                height: '100%', 
                                backgroundColor: getProgressColor(continueLearningCourses[0].progress || 0),
                                borderRadius: '10px',
                                transition: 'width 0.5s ease',
                                boxShadow: `0 0 10px ${getProgressColor(continueLearningCourses[0].progress || 0)}40`
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-0">
                        <button
                          onClick={() => navigate(`/course/${continueLearningCourses[0].id}`)}
                          className="btn w-100"
                          style={{ 
                            backgroundColor: theme.primary, 
                            color: 'white', 
                            fontWeight: '700',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: `0 4px 15px ${theme.primary}40`,
                            transition: 'all 0.2s ease',
                            fontSize: '14px'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = `0 6px 20px ${theme.primary}60`;
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = `0 4px 15px ${theme.primary}40`;
                          }}
                        >
                          <i className="bi bi-play-fill me-2"></i> Lanjut Belajar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Course Cards (2nd and 3rd courses) */}
                {continueLearningCourses.slice(1, 3).map((course, idx) => (
                  <div
                    key={course.id}
                    className="card border-0 overflow-hidden"
                    style={{ 
                      borderRadius: '20px', 
                      boxShadow: theme.shadow,
                      transition: 'all 0.3s ease',
                      background: theme.white
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = theme.shadowHeavy;
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = theme.shadow;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div className="row g-0">
                      <div className="col-md-5 position-relative overflow-hidden">
                        <img
                          src={course.thumbnail_url || 'https://via.placeholder.com/700x450?text=Course'}
                          alt="Thumbnail"
                          className="w-100 h-100"
                          style={{ objectFit: 'cover', minHeight: 260, transition: 'transform 0.3s ease' }}
                        />
                        {/* Overlay Badge */}
                        <div style={{ 
                          position: 'absolute', 
                          top: '16px', 
                          right: '16px',
                          backgroundColor: theme.white,
                          color: theme.primary,
                          padding: '8px 16px',
                          borderRadius: '50px',
                          fontWeight: '700',
                          fontSize: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}>
                          {course.category || 'Umum'}
                        </div>
                      </div>

                      <div className="col-md-7 d-flex flex-column justify-content-between">
                        <div className="p-4">
                          <h3 style={{ fontWeight: '800', color: theme.textMain, marginBottom: '12px', fontSize: '20px', lineHeight: 1.3 }}>
                            {course.title}
                          </h3>
                          
                          <p style={{ color: theme.textMuted, fontSize: '13px', marginBottom: '16px', lineHeight: 1.5 }}>
                            <i className="bi bi-person-circle me-2" style={{ color: theme.primary }}></i>
                            {course.instructor_name || 'Instruktur'}
                          </p>

                          {/* Advanced Progress Bar */}
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <small style={{ color: theme.textSec, fontWeight: '600', fontSize: '12px' }}>Progress Belajar</small>
                              <small style={{ color: theme.primary, fontWeight: '800', fontSize: '13px' }}>
                                {course.progress || 0}%
                              </small>
                            </div>
                            <div style={{ 
                              height: '10px', 
                              borderRadius: '10px', 
                              backgroundColor: theme.border,
                              overflow: 'hidden',
                              position: 'relative'
                            }}>
                              <div
                                style={{ 
                                  width: `${course.progress || 0}%`, 
                                  height: '100%', 
                                  backgroundColor: getProgressColor(course.progress || 0),
                                  borderRadius: '10px',
                                  transition: 'width 0.5s ease',
                                  boxShadow: `0 0 10px ${getProgressColor(course.progress || 0)}40`
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-4 pt-0">
                          <button
                            onClick={() => navigate(`/course/${course.id}`)}
                            className="btn w-100"
                            style={{ 
                              backgroundColor: theme.primary, 
                              color: 'white', 
                              fontWeight: '700',
                              padding: '12px 20px',
                              borderRadius: '12px',
                              border: 'none',
                              boxShadow: `0 4px 15px ${theme.primary}40`,
                              transition: 'all 0.2s ease',
                              fontSize: '14px'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = `0 6px 20px ${theme.primary}60`;
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = `0 4px 15px ${theme.primary}40`;
                            }}
                          >
                            <i className="bi bi-play-fill me-2"></i> Lanjut Belajar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card border-0 p-5 text-center" style={{ borderRadius: '20px', boxShadow: theme.shadow }}>
                 <div style={{ fontSize: '3rem', color: '#DDD', marginBottom: '16px' }}>🎓</div>
                 <h5 style={{ color: theme.textSec, fontWeight: '700' }}>Belum ada kelas yang diambil</h5>
                 <p style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '20px' }}>Mulai petualangan belajarmu sekarang!</p>
                 <button onClick={() => navigate('/')} className="btn" style={{ backgroundColor: theme.primary, color: 'white', fontWeight: '600', borderRadius: '12px' }}>
                   <i className="bi bi-search me-2"></i> Cari Kursus
                 </button>
              </div>
            )}
          </div>

          {/* RIGHT: Stats & Quick Info */}
          <div className="col-lg-5">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Learning Insights Card */}
              <div style={{
                background: `linear-gradient(135deg, ${theme.primary}, #FF6B6B)`,
                borderRadius: '20px',
                padding: '24px',
                boxShadow: `0 10px 30px ${theme.primary}30`,
                color: 'white',
                border: 'none',
                transition: 'all 0.3s ease'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 20px 50px ${theme.primary}50`;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 10px 30px ${theme.primary}30`;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 style={{ fontWeight: '700', margin: 0, fontSize: '15px', opacity: 0.95 }}>
                    <i className="bi bi-lightning-charge me-2"></i> Wawasan Pembelajaran
                  </h6>
                  <div style={{ fontSize: '20px' }}>💡</div>
                </div>
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '16px',
                  padding: '16px',
                  marginBottom: '16px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.9 }}>Milestone Berikutnya</div>
                  {nextMilestone ? (
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>
                        {nextMilestone.title.substring(0, 25)}...
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.85 }}>
                        Capai {nextMilestone.nextMilestone}% untuk bonus 🎁
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>Semua kursus sudah selesai! 🏆</div>
                  )}
                </div>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    backgroundColor: 'white',
                    color: theme.primary,
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <i className="bi bi-arrow-right me-2"></i> Cari Kursus
                </button>
              </div>
              
              {/* Rata-rata Progress Card */}
              <div style={{
                backgroundColor: theme.white,
                borderRadius: '20px',
                padding: '20px',
                boxShadow: theme.shadow,
                border: `2px solid ${theme.border}`,
                transition: 'all 0.3s ease'
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = theme.shadowHeavy;
                  e.currentTarget.style.borderColor = theme.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = theme.shadow;
                  e.currentTarget.style.borderColor = theme.border;
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 style={{ fontWeight: '700', color: theme.textMain, margin: 0, fontSize: '15px' }}>
                    <i className="bi bi-graph-up" style={{ color: '#F59E0B', marginRight: '8px' }}></i>
                    Rata-rata Progress
                  </h6>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: theme.primary }}>
                    {avgProgress}%
                  </div>
                </div>
                <div style={{ 
                  height: '8px', 
                  borderRadius: '10px', 
                  backgroundColor: theme.border,
                  overflow: 'hidden'
                }}>
                  <div
                    style={{ 
                      width: `${avgProgress}%`, 
                      height: '100%', 
                      backgroundColor: theme.primary,
                      borderRadius: '10px',
                      transition: 'width 0.6s ease',
                      boxShadow: `0 0 8px ${theme.primary}50`
                    }}
                  />
                </div>
                <p style={{ color: theme.textMuted, fontSize: '12px', marginTop: '12px', marginBottom: 0 }}>
                  dari {totalCourses} kursus yang sedang diikuti
                </p>
              </div>

              {/* Top Courses */}
              {topCourses.length > 0 && (
                <div style={{
                  backgroundColor: theme.white,
                  borderRadius: '20px',
                  padding: '20px',
                  boxShadow: theme.shadow,
                  transition: 'all 0.3s ease'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = theme.shadowHeavy;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = theme.shadow;
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h6 style={{ fontWeight: '700', color: theme.textMain, margin: 0, fontSize: '15px' }}>
                      <i className="bi bi-star-fill" style={{ color: theme.primary, marginRight: '8px' }}></i>
                      Kursus Terbaik Anda
                    </h6>
                    <span style={{
                      backgroundColor: theme.primary,
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: '50px'
                    }}>
                      TOP {topCourses.length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {topCourses.map((course, idx) => (
                      <div key={course.id}
                        style={{
                          padding: '14px',
                          backgroundColor: idx === 0 ? theme.primary : (idx === 1 ? '#FFA500' : theme.primarySoft),
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          color: idx > 0 ? theme.textMain : 'white'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateX(6px)';
                          e.currentTarget.style.boxShadow = `0 4px 12px rgba(0,0,0,0.1)`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        onClick={() => navigate(`/course/${course.id}`)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              fontWeight: '700', 
                              fontSize: '13px', 
                              marginBottom: '4px',
                              color: idx > 0 ? theme.textMain : 'white'
                            }}>
                              #{idx + 1} {course.title.substring(0, 22)}
                            </div>
                            <div style={{ 
                              fontSize: '11px', 
                              opacity: idx > 0 ? 0.7 : 0.85,
                              color: idx > 0 ? theme.textSec : 'white'
                            }}>
                              {getProgressEmoji(course.progress || 0)} {course.progress || 0}% Selesai
                            </div>
                          </div>
                          <div style={{ 
                            fontSize: '18px', 
                            fontWeight: '800', 
                            color: idx > 0 ? theme.primary : 'white',
                            minWidth: '40px',
                            textAlign: 'right'
                          }}>
                            {course.progress || 0}%
                          </div>
                        </div>
                        <div style={{
                          height: '4px',
                          borderRadius: '4px',
                          backgroundColor: idx > 0 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)',
                          marginTop: '10px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${course.progress || 0}%`,
                            backgroundColor: idx > 0 ? theme.primary : 'white',
                            borderRadius: '4px',
                            transition: 'width 0.5s ease'
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Komponen Kartu Statistik - Enhanced
const StatCard = ({ icon, label, value, color, bgColor, hovered, subtitle, onHover, onLeave }) => {
  const theme = {
    textMain: '#2D2D2D',
    shadow: '0 10px 30px rgba(255, 126, 62, 0.08)',
    shadowHeavy: '0 20px 40px rgba(0,0,0,0.1)',
    border: '#F0F0F0'
  };

  return (
    <div className="col-md-4">
      <div
        className="card border-0 h-100"
        style={{
          borderRadius: '20px',
          boxShadow: hovered ? theme.shadowHeavy : theme.shadow,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: 'white',
          border: `2px solid ${hovered ? color : theme.border}`,
          position: 'relative',
          overflow: 'hidden',
          transform: hovered ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',
          cursor: 'pointer'
        }}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
      >
        {/* Animated Gradient Background */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          backgroundColor: bgColor,
          opacity: hovered ? 1 : 0.3,
          transition: 'all 0.4s ease',
          transform: hovered ? 'scale(1.2)' : 'scale(1)'
        }}></div>

        {/* Animated Glow */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 30% 50%, ${color}10, transparent 70%)`,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}></div>

        <div className="card-body p-4 d-flex align-items-center gap-3 position-relative" style={{ zIndex: 1, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Icon Container */}
            <div
              style={{ 
                width: 70, 
                height: 70, 
                backgroundColor: bgColor, 
                color: color,
                fontSize: '32px',
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 20px ${color}30`,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: hovered ? 'rotate(12deg) scale(1.1)' : 'rotate(0) scale(1)',
                border: `2px solid ${bgColor}`
              }}
            >
              <i className={`bi ${icon}`} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: '900', 
                color: color, 
                fontSize: '32px', 
                lineHeight: 1, 
                marginBottom: '4px',
                transition: 'all 0.3s ease',
                transform: hovered ? 'scale(1.1)' : 'scale(1)'
              }}>
                {value}
              </div>
              <div style={{ 
                color: '#757575', 
                fontWeight: '700', 
                fontSize: '13px',
                letterSpacing: '0.5px'
              }}>
                {label}
              </div>
              {subtitle && (
                <div style={{ 
                  color: color, 
                  fontWeight: '600', 
                  fontSize: '11px',
                  marginTop: '4px',
                  opacity: 0.8
                }}>
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          {/* Animated Arrow */}
          <div style={{
            fontSize: '24px',
            color: color,
            opacity: hovered ? 1 : 0.3,
            transform: hovered ? 'translateX(4px)' : 'translateX(-10px)',
            transition: 'all 0.3s ease'
          }}>
            →
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;