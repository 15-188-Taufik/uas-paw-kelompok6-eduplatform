import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Profile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <>
      <Navbar />

      <div className="container mt-4 mb-5" style={{ maxWidth: "800px" }}>
        <div className="mb-4 border-bottom pb-3">
          <h3 className="fw-bold mb-1">Profil Akun</h3>
          <p className="text-muted mb-0">Informasi akun pengguna</p>
        </div>

        <div className="card border shadow-sm">
          <div className="card-body p-4">
            <div className="d-flex align-items-center gap-4 mb-4">
              <div
                className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center fw-bold"
                style={{ width: "80px", height: "80px", fontSize: "32px" }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <h4 className="fw-bold mb-1">{user.name}</h4>
                <p className="text-muted mb-1">{user.email}</p>
                <span className="badge bg-secondary">
                  {user.role === "student" ? "Mahasiswa" : "Instruktur / Dosen"}
                </span>
              </div>
            </div>

            <hr />

            <div className="row mb-4">
              <div className="col-md-6 mb-3">
                <label className="form-label text-muted small">Nama Lengkap</label>
                <div className="fw-semibold">{user.name}</div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label text-muted small">Email</label>
                <div className="fw-semibold">{user.email}</div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label text-muted small">Peran Akun</label>
                <div className="fw-semibold">
                  {user.role === "student" ? "Mahasiswa" : "Instruktur / Dosen"}
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate(-1)}
              >
                Kembali
              </button>

              <button className="btn btn-primary" disabled>
                Edit Profil
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
