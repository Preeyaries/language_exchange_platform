import { useState } from "react";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";

const BACKEND_URL = "http://localhost:5000";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setMessage("Login successful");
      if (res.data.user?.role === "admin") {
        navigate("/admin/users");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin   = () => { window.location.href = `${BACKEND_URL}/api/auth/google`; };
  const handleFacebookLogin = () => { window.location.href = `${BACKEND_URL}/api/auth/facebook`; };
  const handleAppleLogin    = () => { window.location.href = `${BACKEND_URL}/api/auth/apple`; };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f1c3f;
          font-family: 'Nunito', sans-serif;
          padding: 20px;
        }

        .login-card {
          background: linear-gradient(160deg, #1a3575 0%, #1a2d6b 60%, #162860 100%);
          border-radius: 36px;
          padding: 48px 36px 40px;
          width: 100%;
          max-width: 360px;
          box-shadow: 0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08);
          animation: fadeUp 0.5s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .logo-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 36px;
        }

        .logo-icon { width: 72px; height: 72px; margin-bottom: 4px; }

        .logo-name {
          color: rgba(255,255,255,0.8);
          font-weight: 800;
          font-size: 15px;
          letter-spacing: 1px;
        }

        .login-title {
          color: #fff;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin: 0 0 6px;
        }

        .login-subtitle {
          color: rgba(255,255,255,0.55);
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 28px;
        }

        .input-group { position: relative; margin-bottom: 16px; }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.4);
          font-size: 15px;
          pointer-events: none;
        }

        .login-input {
          width: 100%;
          background: rgba(255,255,255,0.1);
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 14px;
          padding: 14px 16px 14px 44px;
          color: #fff;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, background 0.2s;
        }

        .login-input::placeholder { color: rgba(255,255,255,0.35); }
        .login-input:focus {
          border-color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.15);
        }

        .login-btn {
          width: 100%;
          background: #4a7fe0;
          border: none;
          border-radius: 14px;
          padding: 15px;
          color: #fff;
          font-family: 'Nunito', sans-serif;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.3px;
          cursor: pointer;
          margin-top: 8px;
          transition: background 0.2s, transform 0.15s;
          box-shadow: 0 6px 20px rgba(74,127,224,0.4);
        }

        .login-btn:hover:not(:disabled) { background: #5a8ff0; transform: translateY(-1px); }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }

        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.12); }

        .divider-text {
          color: rgba(255,255,255,0.4);
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .social-row {
          display: flex;
          justify-content: center;
          gap: 14px;
          margin-bottom: 28px;
        }

        .social-btn {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 1.5px solid rgba(255,255,255,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          padding: 0;
        }

        .social-btn:hover { background: rgba(255,255,255,0.18); transform: translateY(-2px); }
        .social-btn:active { transform: translateY(0); }
        .social-btn svg { width: 22px; height: 22px; }

        .social-btn.ui-only { cursor: default; opacity: 0.5; }
        .social-btn.ui-only:hover { background: rgba(255,255,255,0.1); transform: none; }

        .login-footer {
          text-align: center;
          color: rgba(255,255,255,0.35);
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .login-footer a { color: rgba(255,255,255,0.55); text-decoration: underline; }

        .register-row {
          text-align: center;
          color: rgba(255,255,255,0.45);
          font-size: 13px;
          font-weight: 600;
        }

        .register-row a { color: #fff; font-weight: 800; text-decoration: none; }
        .register-row a:hover { text-decoration: underline; }

        .msg {
          text-align: center;
          font-size: 13px;
          font-weight: 700;
          margin: 10px 0 0;
          min-height: 20px;
          color: #ff8fa3;
        }

        .msg.success { color: #7effa8; }
      `}</style>

      <div className="login-wrapper">
        <div className="login-card">

          {/* Logo */}
          <div className="logo-area">
            <svg className="logo-icon" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="10" width="34" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
              <text x="16" y="30" fill="white" fontSize="16" fontWeight="800" fontFamily="Nunito, sans-serif">A</text>
              <rect x="30" y="28" width="34" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
              <text x="38" y="48" fill="white" fontSize="14" fontWeight="800" fontFamily="Nunito, sans-serif">文</text>
              <circle cx="52" cy="22" r="14" fill="rgba(74,127,224,0.3)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
              <path d="M52 10 Q58 16 52 22 Q46 28 52 34" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none"/>
              <path d="M44 22 Q52 20 60 22" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none"/>
            </svg>
            <span className="logo-name">Bello!</span>
          </div>

          <h2 className="login-title">LOG IN</h2>
          <p className="login-subtitle">Sign in with email address</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <span className="input-icon">✉</span>
              <input
                className="login-input"
                name="email"
                type="email"
                placeholder="Yourname@gmail.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input
                className="login-input"
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Log In"}
            </button>
          </form>

          {message && (
            <p className={`msg ${message === "Login successful" ? "success" : ""}`}>
              {message}
            </p>
          )}

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">Or continue with</span>
            <div className="divider-line" />
          </div>

          <div className="social-row">
            {/* WhatsApp — UI only */}
            <button className="social-btn ui-only" type="button" title="WhatsApp" disabled>
              <svg viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>

            {/* Google — functional */}
            <button className="social-btn" type="button" title="Continue with Google" onClick={handleGoogleLogin}>
              <svg viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>

            {/* Facebook — functional */}
            <button className="social-btn" type="button" title="Continue with Facebook" onClick={handleFacebookLogin}>
              <svg viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>

            {/* Apple — functional */}
            <button className="social-btn" type="button" title="Continue with Apple" onClick={handleAppleLogin}>
              <svg viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </button>
          </div>

          <p className="login-footer">
            By registering you with our <a href="#">Terms and Conditions</a>
          </p>

          <p className="register-row">
            Don't have account? <Link to="/register">Sign Up now</Link>
          </p>

        </div>
      </div>
    </>
  );
}

export default Login;