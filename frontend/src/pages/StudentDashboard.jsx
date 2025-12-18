import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
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
        const response = await api.get(`/students/${user.id}/courses`);
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

  const lastActiveCourse =
    courses.find(c => (c.progress || 0) > 0 && (c.progress || 0) < 100) || courses[0];

  const todayText = useMemo(() => {
    return new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
          <div className="mt-3 text-muted small">Memuat dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 py-4" style={{ background: '#f6f7fb' }}>
      <div className="container" style={{ maxWidth: 1040 }}>
        {/* HEADER */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2">
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 text-primary"
                style={{ width: 42, height: 42 }}
              >
                <i className="bi bi-speedometer2 fs-5" />
              </span>
              <div>
                <h2 className="fw-bold text-dark mb-0">Dashboard</h2>
                <div className="text-muted">
                  Halo, <span className="text-primary fw-bold">{user?.name || 'Student'}</span> 👋
                </div>
              </div>
            </div>
          </div>

          <div className="ms-auto">
            <div
              className="bg-white border shadow-sm px-3 py-2 rounded-4 d-flex align-items-center gap-2"
              style={{ height: 46 }}
            >
              <i className="bi bi-calendar3 text-primary" />
              <span className="fw-semibold text-dark small">{todayText}</span>
            </div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="row g-3 mb-4">
          <StatCard
            icon="bi-journal-bookmark-fill"
            label="Total Kursus"
            value={totalCourses}
            tone="primary"
          />
          <StatCard
            icon="bi-clock-history"
            label="Sedang Dipelajari"
            value={activeCourses}
            tone="warning"
          />
          <StatCard icon="bi-trophy-fill" label="Selesai" value={completedCourses} tone="success" />
        </div>

        {/* MAIN GRID */}
        <div className="row g-3">
          {/* LEFT: Continue Learning */}
          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="fw-bold text-dark mb-0">Lanjutkan Pembelajaran</h5>
              <button
                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                onClick={() => navigate('/')}
              >
                Lihat semua kursus <i className="bi bi-arrow-right ms-1" />
              </button>
            </div>

            {lastActiveCourse ? (
              <div
                className="card border-0 shadow-sm overflow-hidden"
                style={{ borderRadius: 18 }}
              >
                <div className="row g-0">
                  <div className="col-md-5">
                    <div style={{ height: '100%' }}>
                      <img
                        src={
                          lastActiveCourse.thumbnail_url ||
                          'https://via.placeholder.com/700x450?text=Course+Thumbnail'
                        }
                        alt="Thumbnail"
                        className="w-100 h-100"
                        style={{
                          objectFit: 'cover',
                          minHeight: 220,
                          display: 'block',
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-md-7">
                    <div className="card-body p-4">
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                        <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2">
                          {lastActiveCourse.category || 'Kategori Umum'}
                        </span>

                        {(lastActiveCourse.progress || 0) === 100 ? (
                          <span className="badge rounded-pill bg-success bg-opacity-10 text-success px-3 py-2">
                            Selesai <i className="bi bi-check2-circle ms-1" />
                          </span>
                        ) : (lastActiveCourse.progress || 0) > 0 ? (
                          <span className="badge rounded-pill bg-warning bg-opacity-10 text-warning px-3 py-2">
                            Sedang berjalan <i className="bi bi-lightning-charge ms-1" />
                          </span>
                        ) : (
                          <span className="badge rounded-pill bg-secondary bg-opacity-10 text-secondary px-3 py-2">
                            Belum mulai
                          </span>
                        )}
                      </div>

                      <h4 className="fw-bold text-dark mb-2">{lastActiveCourse.title}</h4>

                      <div className="mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="fw-semibold text-muted">Progress Belajar</small>
                          <small className="fw-bold text-primary">
                            {lastActiveCourse.progress || 0}%
                          </small>
                        </div>
                        <div className="progress" style={{ height: 10, borderRadius: 999 }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            aria-valuenow={lastActiveCourse.progress || 0}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            style={{
                              width: `${lastActiveCourse.progress || 0}%`,
                              borderRadius: 999,
                            }}
                          />
                        </div>
                      </div>

                      <div className="d-flex flex-wrap gap-2 mt-4">
                        <button
                          onClick={() => navigate(`/course/${lastActiveCourse.id}`)}
                          className="btn btn-primary fw-bold rounded-pill px-4 py-2"
                        >
                          Lanjutkan Belajar <i className="bi bi-arrow-right ms-2" />
                        </button>

                        <button
                          onClick={() => navigate('/')}
                          className="btn btn-light border fw-semibold rounded-pill px-4 py-2"
                        >
                          Cari kursus lain
                        </button>
                      </div>

                      <div className="mt-3 text-muted small">
                        <i className="bi bi-info-circle me-1" />
                        Tips: Belajar 10–15 menit tiap hari lebih konsisten.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card border-0 shadow-sm" style={{ borderRadius: 18 }}>
                <div className="card-body text-center py-5">
                  <div className="mb-3 text-muted opacity-50">
                    <i className="bi bi-inbox fs-1" />
                  </div>
                  <h5 className="fw-bold text-muted mb-1">Belum ada aktivitas belajar</h5>
                  <p className="text-muted small mb-3">
                    Mulai perjalanan belajarmu dengan mendaftar kursus baru.
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="btn btn-outline-primary rounded-pill px-4"
                  >
                    Cari Kursus
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Quick Actions / Placeholder for Deadline & Upload Assignment */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 18 }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fw-bold mb-0">Aksi Cepat</h6>
                  <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill">
                    Beta UI
                  </span>
                </div>

                <div className="d-grid gap-2">
                  <button className="btn btn-light border rounded-4 text-start py-3">
                    <div className="d-flex gap-3 align-items-center">
                      <span className="text-primary">
                        <i className="bi bi-calendar-event fs-4" />
                      </span>
                      <div>
                        <div className="fw-semibold text-dark">Deadline Tugas</div>
                        <div className="text-muted small">Lihat deadline & pengingat</div>
                      </div>
                    </div>
                  </button>

                  <button className="btn btn-light border rounded-4 text-start py-3">
                    <div className="d-flex gap-3 align-items-center">
                      <span className="text-success">
                        <i className="bi bi-cloud-arrow-up fs-4" />
                      </span>
                      <div>
                        <div className="fw-semibold text-dark">Upload File Assignment</div>
                        <div className="text-muted small">Kumpulkan tugas dengan mudah</div>
                      </div>
                    </div>
                  </button>

                  <button className="btn btn-light border rounded-4 text-start py-3">
                    <div className="d-flex gap-3 align-items-center">
                      <span className="text-danger">
                        <i className="bi bi-google fs-4" />
                      </span>
                      <div>
                        <div className="fw-semibold text-dark">Login Google</div>
                        <div className="text-muted small">Masuk cepat pakai akun Google</div>
                      </div>
                    </div>
                  </button>
                </div>

                <hr className="my-4" />

                <div className="text-muted small">
                  <div className="fw-semibold text-dark mb-1">Catatan</div>
                  Bagian ini bisa kamu hubungkan ke fitur <b>deadline</b>, <b>upload assignment</b>,
                  dan <b>Google login</b> saat backend siap.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* small spacing */}
        <div className="py-3" />
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, tone = 'primary' }) => {
  const toneMap = {
    primary: { text: 'text-primary', bg: 'bg-primary bg-opacity-10' },
    warning: { text: 'text-warning', bg: 'bg-warning bg-opacity-10' },
    success: { text: 'text-success', bg: 'bg-success bg-opacity-10' },
    danger: { text: 'text-danger', bg: 'bg-danger bg-opacity-10' },
    secondary: { text: 'text-secondary', bg: 'bg-secondary bg-opacity-10' },
  };

  const t = toneMap[tone] || toneMap.primary;

  return (
    <div className="col-md-4">
      <div
        className="card border-0 shadow-sm h-100"
        style={{
          borderRadius: 18,
          transition: 'transform .15s ease, box-shadow .15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0px)')}
      >
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-3">
            <div
              className={`d-inline-flex align-items-center justify-content-center rounded-4 ${t.bg} ${t.text}`}
              style={{ width: 52, height: 52 }}
            >
              <i className={`bi ${icon} fs-4`} />
            </div>
            <div>
              <div className="fw-bold text-dark" style={{ fontSize: 26, lineHeight: 1 }}>
                {value}
              </div>
              <div className="text-muted fw-semibold">{label}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
