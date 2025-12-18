import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/login", { email, password });
      if (response.data?.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate(
          response.data.user.role === "instructor"
            ? "/instructor-dashboard"
            : "/student-dashboard",
          { replace: true }
        );
      }
    } catch {
      setError("Email atau password salah.");
    }
  };

  const handleGoogleLogin = () => {
    alert("Login Google belum dihubungkan ke backend");
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{
        background: "linear-gradient(135deg, #eaf2ff, #f8fafc)",
      }}
    >
      <div
        className="card border-0 shadow-lg"
        style={{ width: "420px", borderRadius: "14px" }}
      >
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <h3 className="fw-bold mb-1">Selamat Datang Kembali</h3>
            <p className="text-muted small">
              Silakan masuk ke akun EduPlatform Anda
            </p>
          </div>

          {error && (
            <div className="alert alert-danger small py-2 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Email</label>
              <input
                type="email"
                className="form-control form-control-lg"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold">Password</label>
              <input
                type="password"
                className="form-control form-control-lg"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-bold"
              style={{ borderRadius: "10px" }}
            >
              Masuk
            </button>
          </form>

          <div className="my-4 d-flex align-items-center">
            <hr className="flex-grow-1" />
            <span className="mx-2 text-muted small">atau</span>
            <hr className="flex-grow-1" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="btn w-100 d-flex align-items-center justify-content-center gap-2 border"
            style={{
              borderRadius: "10px",
              padding: "12px",
              backgroundColor: "#fff",
            }}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              style={{ width: "20px" }}
            />
            <span className="fw-semibold">Masuk dengan Google</span>
          </button>

          <div className="text-center mt-4">
            <small className="text-muted">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="fw-bold text-decoration-none"
              >
                Buat Akun Baru
              </Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
