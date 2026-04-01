import { useState } from "react";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import PhoneFrame from "../components/PhoneFrame";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function Login() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setMessage("Login successful");
      navigate(res.data.user?.role === "admin" ? "/admin/users" : "/feed");
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
    <PhoneFrame>
      {/* Center card vertically inside phone frame */}
      <div className="flex-1 flex items-center justify-center px-5 py-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        {/* Card */}
        <div className="w-full rounded-[36px] px-9 py-12
          bg-gradient-to-br from-[#1a3575] via-[#1a2d6b] to-[#162860]
          ,inset_0_1px_0_rgba(255,255,255,0.08)]">

          {/* Logo */}
          <div className="flex flex-col items-center mb-9">
            <svg className="w-[72px] h-[72px] mb-1" viewBox="0 0 72 72" fill="none">
              <rect x="8" y="10" width="34" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
              <text x="16" y="30" fill="white" fontSize="16" fontWeight="800" fontFamily="Nunito,sans-serif">A</text>
              <rect x="30" y="28" width="34" height="26" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
              <text x="38" y="48" fill="white" fontSize="14" fontWeight="800" fontFamily="Nunito,sans-serif">文</text>
              <circle cx="52" cy="22" r="14" fill="rgba(74,127,224,0.3)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
              <path d="M52 10 Q58 16 52 22 Q46 28 52 34" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none"/>
              <path d="M44 22 Q52 20 60 22" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none"/>
            </svg>
            <span className="text-white/80 font-extrabold text-[15px] tracking-widest">Bello!</span>
          </div>

          {/* Title */}
          <h2 className="text-white text-[32px] font-extrabold tracking-tight mb-1.5">LOG IN</h2>
          <p className="text-white/55 text-sm font-semibold mb-7">Sign in with email address</p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-[15px] pointer-events-none">✉</span>
              <input name="email" type="email" placeholder="Yourname@gmail.com"
                value={form.email} onChange={handleChange} required
                className="w-full bg-white/10 border border-white/12 rounded-[14px] py-[14px] pl-11 pr-4
                  text-white text-sm font-semibold outline-none placeholder:text-white/35
                  focus:border-white/35 focus:bg-white/15 transition-all" />
            </div>

            <div className="relative mb-2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-[15px] pointer-events-none">🔒</span>
              <input name="password" type="password" placeholder="Password"
                value={form.password} onChange={handleChange} required
                className="w-full bg-white/10 border border-white/12 rounded-[14px] py-[14px] pl-11 pr-4
                  text-white text-sm font-semibold outline-none placeholder:text-white/35
                  focus:border-white/35 focus:bg-white/15 transition-all" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full mt-2 bg-[#4a7fe0] border-none rounded-[14px] py-[15px]
                text-white text-[15px] font-extrabold tracking-wide cursor-pointer
                shadow-[0_6px_20px_rgba(74,127,224,0.4)]
                hover:bg-[#5a8ff0] hover:-translate-y-px active:translate-y-0
                disabled:opacity-70 disabled:cursor-not-allowed transition-all">
              {loading ? "Signing in..." : "Log In"}
            </button>
          </form>

          {message && (
            <p className={`text-center text-[13px] font-bold mt-2.5 ${message === "Login successful" ? "text-[#7effa8]" : "text-[#ff8fa3]"}`}>
              {message}
            </p>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/12" />
            <span className="text-white/40 text-xs font-bold whitespace-nowrap">Or continue with</span>
            <div className="flex-1 h-px bg-white/12" />
          </div>

          {/* Social */}
          <div className="flex justify-center gap-3.5 mb-7">
            <button disabled className="w-[52px] h-[52px] rounded-full bg-white/10 border border-white/12 flex items-center justify-center opacity-50 cursor-default p-0">
              <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>

            <button type="button" onClick={handleGoogleLogin}
              className="w-[52px] h-[52px] rounded-full bg-white/10 border border-white/12 flex items-center justify-center cursor-pointer p-0 hover:bg-white/18 hover:-translate-y-0.5 transition-all">
              <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>

            <button type="button" onClick={handleFacebookLogin}
              className="w-[52px] h-[52px] rounded-full bg-white/10 border border-white/12 flex items-center justify-center cursor-pointer p-0 hover:bg-white/18 hover:-translate-y-0.5 transition-all">
              <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>

            <button type="button" onClick={handleAppleLogin}
              className="w-[52px] h-[52px] rounded-full bg-white/10 border border-white/12 flex items-center justify-center cursor-pointer p-0 hover:bg-white/18 hover:-translate-y-0.5 transition-all">
              <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </button>
          </div>

          <p className="text-center text-white/35 text-xs font-semibold mb-5">
            By registering you with our{" "}
            <a href="#" className="text-white/55 underline">Terms and Conditions</a>
          </p>

          <p className="text-center text-white/45 text-[13px] font-semibold">
            Don't have account?{" "}
            <Link to="/register" className="text-white font-extrabold no-underline hover:underline">
              Sign Up now
            </Link>
          </p>

        </div>
      </div>
    </PhoneFrame>
  );
}

export default Login;