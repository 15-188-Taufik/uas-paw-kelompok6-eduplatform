import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/register", formData);
      if (response.data.success) {
        alert("Registrasi berhasil. Silakan login.");
        navigate("/login");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "Registrasi gagal. Coba lagi."
      );
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ background: "linear-gradient(135deg, #eaf2ff, #f8fafc)" }}
    >
      <div
        className="card border-0 shadow-lg"
        style={{ width: "420px", borderRadius: "14px" }}
      >
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <h3 className="fw-bold mb-1">Daftar Akun Baru</h3>
            <p className="text-muted small">
              Buat akun EduPlatform untuk mulai belajar
            </p>
          </div>

          {error && (
            <div className="alert alert-danger small py-2 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                className="form-control form-control-lg"
                placeholder="Contoh: Budi Santoso"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Email</label>
              <input
                type="email"
                name="email"
                className="form-control form-control-lg"
                placeholder="nama@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">
                Password
              </label>
              <input
                type="password"
                name="password"
                className="form-control form-control-lg"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold">
                Daftar Sebagai
              </label>
              <select
                name="role"
                className="form-select form-select-lg"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Mahasiswa (Student)</option>
                <option value="instructor">Instruktur (Dosen)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-bold"
              style={{ borderRadius: "10px" }}
            >
              Daftar Sekarang
            </button>
          </form>

          <div className="text-center mt-4">
            <small className="text-muted">
              Sudah punya akun?{" "}
              <Link
                to="/login"
                className="fw-bold text-decoration-none"
              >
                Login di sini
              </Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
