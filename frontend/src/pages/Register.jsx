import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";

const BACKEND_URL = "http://localhost:5000";

const LANGUAGES = [
  "English", "Thai", "Japanese", "Korean", "Chinese (Mandarin)",
  "Chinese (Cantonese)", "French", "German", "Spanish", "Italian",
  "Portuguese", "Arabic", "Hindi", "Russian", "Vietnamese",
  "Indonesian", "Malay", "Dutch", "Swedish", "Polish",
];

const LEVELS = [
  { label: "A1 – Beginner", value: "A1" },
  { label: "A2 – Elementary", value: "A2" },
  { label: "B1 – Intermediate", value: "B1" },
  { label: "B2 – Upper-Intermediate", value: "B2" },
  { label: "C1 – Advanced", value: "C1" },
  { label: "C2 – Native/Mastery", value: "C2" },
];

const ALL_INTERESTS = [
  "Exercise", "Movie", "Podcast", "Book", "Food", "Music", "Travel",
  "Gaming", "Art", "Fashion", "Tech", "Sports", "Photography", "Cooking",
  "Dance", "Nature", "Anime", "Reading",
];

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const [form, setForm] = useState({
    // Step 1
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Step 2
    dateOfBirth: "",
    gender: "",
    country: "",
    city: "",
    // Step 3
    nativeLanguage: "",
    learningLanguages: [{ language: "", level: "" }],
    interests: [],
    bio: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  });

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  // --- Step 1 handlers ---
  const handleChange = (e) => set(e.target.name, e.target.value);

  const validateStep1 = () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setMessage("Please fill in all fields.");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return false;
    }
    setMessage("");
    return true;
  };

  const validateStep2 = () => {
    if (!form.dateOfBirth || !form.gender) {
      setMessage("Please fill in Date of Birth and Gender.");
      return false;
    }
    setMessage("");
    return true;
  };

  // --- Step 3: learning languages ---
  const addLearningLanguage = () => {
    set("learningLanguages", [...form.learningLanguages, { language: "", level: "" }]);
  };

  const updateLearningLanguage = (index, field, value) => {
    const updated = form.learningLanguages.map((l, i) =>
      i === index ? { ...l, [field]: value } : l
    );
    set("learningLanguages", updated);
  };

  // --- Step 3: interests ---
  const toggleInterest = (item) => {
    const current = form.interests;
    if (current.includes(item)) {
      set("interests", current.filter((i) => i !== item));
    } else {
      set("interests", [...current, item]);
    }
  };

  // --- Final submit ---
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        country: form.country,
        city: form.city,
        nativeLanguage: form.nativeLanguage,
        learningLanguages: form.learningLanguages.filter((l) => l.language),
        interests: form.interests,
        bio: form.bio,
        timezone: form.timezone,
      };
      const res = await API.post("/auth/register", payload);
      setMessage(res.data.message || "Registered successfully!");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .reg-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f1c3f;
          font-family: 'Nunito', sans-serif;
          padding: 20px;
        }

        .reg-card {
          background: linear-gradient(160deg, #1a3575 0%, #1a2d6b 60%, #162860 100%);
          border-radius: 36px;
          padding: 44px 32px 36px;
          width: 100%;
          max-width: 360px;
          box-shadow: 0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08);
          animation: fadeUp 0.4s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Step indicator */
        .step-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 28px;
        }

        .step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          transition: all 0.3s;
        }

        .step-dot.active {
          background: #4a7fe0;
          width: 24px;
          border-radius: 4px;
        }

        .step-dot.done {
          background: rgba(255,255,255,0.5);
        }

        /* Title */
        .reg-title {
          color: #fff;
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 4px;
          letter-spacing: -0.3px;
        }

        .reg-section-label {
          color: rgba(255,255,255,0.6);
          font-size: 13px;
          font-weight: 700;
          margin: 0 0 22px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Input */
        .input-group {
          position: relative;
          margin-bottom: 14px;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.35);
          font-size: 15px;
          pointer-events: none;
        }

        .reg-input {
          width: 100%;
          background: rgba(255,255,255,0.12);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 13px 16px 13px 44px;
          color: #fff;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }

        .reg-input.no-icon { padding-left: 16px; }

        .reg-input::placeholder { color: rgba(255,255,255,0.3); }
        .reg-input:focus {
          border-color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.16);
        }

        .pw-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.4);
          font-size: 14px;
          padding: 0;
        }

        /* Select */
        .reg-select {
          width: 100%;
          background: rgba(255,255,255,0.12);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 13px 36px 13px 16px;
          color: #fff;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          appearance: none;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }

        .reg-select:focus {
          border-color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.16);
        }

        .reg-select option { background: #1a2d6b; color: #fff; }

        .select-wrap {
          position: relative;
          margin-bottom: 14px;
        }

        .select-arrow {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: rgba(255,255,255,0.4);
          font-size: 12px;
        }

        /* Field label */
        .field-label {
          color: rgba(255,255,255,0.7);
          font-size: 13px;
          font-weight: 700;
          margin: 0 0 8px;
          display: block;
        }

        /* Gender radio */
        .gender-row {
          display: flex;
          gap: 20px;
          margin-bottom: 18px;
        }

        .gender-option {
          display: flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          color: rgba(255,255,255,0.75);
          font-size: 14px;
          font-weight: 600;
        }

        .gender-radio {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.35);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: border-color 0.2s;
        }

        .gender-radio.selected {
          border-color: #4a7fe0;
          background: #4a7fe0;
        }

        .gender-radio.selected::after {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #fff;
        }

        /* Language pair row */
        .lang-pair {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
          align-items: center;
        }

        .lang-pair .select-wrap {
          flex: 1;
          margin-bottom: 0;
        }

        /* Add more button */
        .add-more-btn {
          width: 100%;
          background: #4a7fe0;
          border: none;
          border-radius: 12px;
          padding: 11px;
          color: #fff;
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          margin-bottom: 20px;
          transition: background 0.2s;
        }

        .add-more-btn:hover { background: #5a8ff0; }

        /* Interests */
        .interests-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .interest-chip {
          background: rgba(255,255,255,0.1);
          border: 1.5px solid rgba(255,255,255,0.15);
          border-radius: 20px;
          padding: 6px 14px;
          color: rgba(255,255,255,0.65);
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .interest-chip.selected {
          background: #4a7fe0;
          border-color: #4a7fe0;
          color: #fff;
        }

        .interest-chip:hover:not(.selected) {
          background: rgba(255,255,255,0.16);
          border-color: rgba(255,255,255,0.3);
        }

        /* Bio textarea */
        .reg-textarea {
          width: 100%;
          background: rgba(255,255,255,0.12);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 13px 16px;
          color: #fff;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          resize: none;
          min-height: 90px;
          margin-bottom: 20px;
          transition: border-color 0.2s, background 0.2s;
        }

        .reg-textarea::placeholder { color: rgba(255,255,255,0.3); }
        .reg-textarea:focus {
          border-color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.16);
        }

        /* Primary button */
        .primary-btn {
          width: 100%;
          background: #4a7fe0;
          border: none;
          border-radius: 14px;
          padding: 15px;
          color: #fff;
          font-family: 'Nunito', sans-serif;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          margin-top: 4px;
          transition: background 0.2s, transform 0.15s;
          box-shadow: 0 6px 20px rgba(74,127,224,0.4);
          letter-spacing: 0.3px;
        }

        .primary-btn:hover:not(:disabled) { background: #5a8ff0; transform: translateY(-1px); }
        .primary-btn:active:not(:disabled) { transform: translateY(0); }
        .primary-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 22px 0;
        }

        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.12); }
        .divider-text { color: rgba(255,255,255,0.4); font-size: 12px; font-weight: 700; }

        /* Social */
        .social-row { display: flex; justify-content: center; gap: 14px; margin-bottom: 22px; }

        .social-btn {
          width: 48px;
          height: 48px;
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
        .social-btn svg { width: 20px; height: 20px; }
        .social-btn.ui-only { cursor: default; opacity: 0.5; }
        .social-btn.ui-only:hover { background: rgba(255,255,255,0.1); transform: none; }

        /* Footer */
        .reg-footer {
          text-align: center;
          color: rgba(255,255,255,0.35);
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 14px;
        }

        .reg-footer a { color: rgba(255,255,255,0.55); text-decoration: underline; }

        .login-row {
          text-align: center;
          color: rgba(255,255,255,0.45);
          font-size: 13px;
          font-weight: 600;
        }

        .login-row a { color: #fff; font-weight: 800; text-decoration: none; }
        .login-row a:hover { text-decoration: underline; }

        /* Message */
        .msg {
          text-align: center;
          font-size: 13px;
          font-weight: 700;
          margin: 10px 0 0;
          min-height: 18px;
          color: #ff8fa3;
        }

        .msg.success { color: #7effa8; }

        /* Scroll for step 3 */
        .reg-card.scrollable { max-height: 90vh; overflow-y: auto; }
        .reg-card.scrollable::-webkit-scrollbar { width: 0; }
      `}</style>

      <div className="reg-wrapper">
        <div className={`reg-card${step === 3 ? " scrollable" : ""}`}>

          {/* Step dots */}
          <div className="step-dots">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`step-dot ${s === step ? "active" : s < step ? "done" : ""}`}
              />
            ))}
          </div>

          {/* ─── STEP 1: Account Info ─── */}
          {step === 1 && (
            <>
              <h2 className="reg-title">SIGN UP</h2>
              <p className="reg-section-label">Account Information</p>

              <div className="input-group">
                <span className="input-icon">👤</span>
                <input className="reg-input" name="name" placeholder="Full Name"
                  value={form.name} onChange={handleChange} />
              </div>

              <div className="input-group">
                <span className="input-icon">✉</span>
                <input className="reg-input" name="email" type="email" placeholder="Your Email"
                  value={form.email} onChange={handleChange} />
              </div>

              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input className="reg-input" name="password"
                  type={showPw ? "text" : "password"} placeholder="Password"
                  value={form.password} onChange={handleChange} />
                <button className="pw-toggle" type="button" onClick={() => setShowPw(!showPw)}>
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>

              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input className="reg-input" name="confirmPassword"
                  type={showCpw ? "text" : "password"} placeholder="Confirm Password"
                  value={form.confirmPassword} onChange={handleChange} />
                <button className="pw-toggle" type="button" onClick={() => setShowCpw(!showCpw)}>
                  {showCpw ? "🙈" : "👁"}
                </button>
              </div>

              {message && <p className="msg">{message}</p>}

              <button className="primary-btn" style={{ marginTop: 16 }} onClick={() => {
                if (validateStep1()) setStep(2);
              }}>
                Next
              </button>

              <div className="divider">
                <div className="divider-line" />
                <span className="divider-text">Or continue with</span>
                <div className="divider-line" />
              </div>

              <div className="social-row">
                <button className="social-btn ui-only" disabled title="WhatsApp">
                  <svg viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </button>
                <button className="social-btn" onClick={() => { window.location.href = `${BACKEND_URL}/api/auth/google`; }}>
                  <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                </button>
                <button className="social-btn" onClick={() => { window.location.href = `${BACKEND_URL}/api/auth/facebook`; }}>
                  <svg viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </button>
                <button className="social-btn" onClick={() => { window.location.href = `${BACKEND_URL}/api/auth/apple`; }}>
                  <svg viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                </button>
              </div>

              <p className="reg-footer">
                By registering you with our <a href="#">Terms and Conditions</a>
              </p>
              <p className="login-row">
                Already have an account? <Link to="/login">Log in →</Link>
              </p>
            </>
          )}

          {/* ─── STEP 2: Personal Info ─── */}
          {step === 2 && (
            <>
              <h2 className="reg-title">Personal Information</h2>
              <p className="reg-section-label" style={{ marginBottom: 20 }}> </p>

              <label className="field-label">Date of Birth</label>
              <div className="input-group">
                <span className="input-icon">📅</span>
                <input className="reg-input" name="dateOfBirth" type="date"
                  value={form.dateOfBirth} onChange={handleChange}
                  style={{ colorScheme: "dark" }} />
              </div>

              <label className="field-label">Gender</label>
              <div className="gender-row">
                {["Male", "Female", "Other"].map((g) => (
                  <label key={g} className="gender-option" onClick={() => set("gender", g)}>
                    <div className={`gender-radio ${form.gender === g ? "selected" : ""}`} />
                    {g}
                  </label>
                ))}
              </div>

              <label className="field-label">Country</label>
              <div className="input-group">
                <input className="reg-input no-icon" name="country" placeholder="e.g. Thailand"
                  value={form.country} onChange={handleChange} />
              </div>

              <label className="field-label">City</label>
              <div className="input-group">
                <input className="reg-input no-icon" name="city" placeholder="e.g. Bangkok"
                  value={form.city} onChange={handleChange} />
              </div>

              {message && <p className="msg">{message}</p>}

              <button className="primary-btn" style={{ marginTop: 8 }} onClick={() => {
                if (validateStep2()) setStep(3);
              }}>
                Next
              </button>

              <p style={{ textAlign: "center", marginTop: 16 }}>
                <button onClick={() => setStep(1)} style={{
                  background: "none", border: "none", color: "rgba(255,255,255,0.45)",
                  fontFamily: "Nunito", fontSize: 13, fontWeight: 700, cursor: "pointer"
                }}>← Back</button>
              </p>
            </>
          )}

          {/* ─── STEP 3: Language & Interests ─── */}
          {step === 3 && (
            <>
              <h2 className="reg-title" style={{ marginBottom: 20 }}>Language</h2>

              <label className="field-label">Native Language</label>
              <div className="select-wrap">
                <select className="reg-select" value={form.nativeLanguage}
                  onChange={(e) => set("nativeLanguage", e.target.value)}>
                  <option value="">Select your language</option>
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <span className="select-arrow">▼</span>
              </div>

              <label className="field-label">Learning Language</label>
              {form.learningLanguages.map((ll, i) => (
                <div key={i} className="lang-pair">
                  <div className="select-wrap" style={{ flex: 2 }}>
                    <select className="reg-select" value={ll.language}
                      onChange={(e) => updateLearningLanguage(i, "language", e.target.value)}>
                      <option value="">Select language</option>
                      {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <span className="select-arrow">▼</span>
                  </div>
                  <div className="select-wrap" style={{ flex: 1.5 }}>
                    <select className="reg-select" value={ll.level}
                      onChange={(e) => updateLearningLanguage(i, "level", e.target.value)}>
                      <option value="">Level</option>
                      {LEVELS.map((lv) => <option key={lv.value} value={lv.value}>{lv.label}</option>)}
                    </select>
                    <span className="select-arrow">▼</span>
                  </div>
                </div>
              ))}

              <button className="add-more-btn" onClick={addLearningLanguage}>
                + Add More
              </button>

              <h2 className="reg-title" style={{ fontSize: 20, marginBottom: 6 }}>Personal Interest</h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, margin: "0 0 12px" }}>
                Tap the activities to choose your interests
              </p>

              <div className="interests-wrap">
                {ALL_INTERESTS.map((item) => (
                  <button key={item} type="button"
                    className={`interest-chip ${form.interests.includes(item) ? "selected" : ""}`}
                    onClick={() => toggleInterest(item)}>
                    + {item}
                  </button>
                ))}
              </div>

              <h2 className="reg-title" style={{ fontSize: 20, marginBottom: 10 }}>Bio</h2>
              <textarea className="reg-textarea" placeholder="Tell others about yourself..."
                value={form.bio} onChange={(e) => set("bio", e.target.value)} />

              {message && (
                <p className={`msg ${message.includes("success") || message.includes("success") ? "success" : ""}`}>
                  {message}
                </p>
              )}

              <button className="primary-btn" disabled={loading} onClick={handleSubmit}>
                {loading ? "Signing up..." : "Sign up"}
              </button>

              <p style={{ textAlign: "center", marginTop: 16 }}>
                <button onClick={() => setStep(2)} style={{
                  background: "none", border: "none", color: "rgba(255,255,255,0.45)",
                  fontFamily: "Nunito", fontSize: 13, fontWeight: 700, cursor: "pointer"
                }}>← Back</button>
              </p>
            </>
          )}

        </div>
      </div>
    </>
  );
}

export default Register;