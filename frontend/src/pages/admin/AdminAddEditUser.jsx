// src/pages/admin/AdminAddEditUser.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import API from "../../api/api";

const LANGUAGES = [
  "English","Thai","Japanese","Korean","Chinese (Mandarin)","Chinese (Cantonese)",
  "French","German","Spanish","Italian","Portuguese","Arabic","Hindi","Russian",
  "Vietnamese","Indonesian","Malay","Dutch","Swedish","Polish",
];

const LEVELS = [
  { label:"A1 – Beginner", value:"A1" },
  { label:"A2 – Elementary", value:"A2" },
  { label:"B1 – Intermediate", value:"B1" },
  { label:"B2 – Upper-Intermediate", value:"B2" },
  { label:"C1 – Advanced", value:"C1" },
  { label:"C2 – Native/Mastery", value:"C2" },
];

const ALL_INTERESTS = [
  "Exercise","Movie","Podcast","Book","Food","Music","Travel","Gaming",
  "Art","Fashion","Tech","Sports","Photography","Cooking","Dance","Anime","Reading",
];

const ADMIN_POSITIONS = [
  "Super Admin","Content Moderator","User Support","Community Manager",
  "Data Analyst","Security Admin","Marketing Admin","Technical Admin",
];

const LANG_FLAG = {
  English:"🇬🇧", Thai:"🇹🇭", Japanese:"🇯🇵", Korean:"🇰🇷",
  "Chinese (Mandarin)":"🇨🇳", French:"🇫🇷", German:"🇩🇪",
  Spanish:"🇪🇸", Italian:"🇮🇹", Portuguese:"🇵🇹",
};

export default function AdminAddEditUser() {
  const { id } = useParams(); // if id exists → edit mode
  const navigate = useNavigate();
  const isEdit = !!id;

  const [role, setRole]       = useState("user"); // "user" | "admin"
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [message, setMessage] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [showAllInterests, setShowAllInterests] = useState(false);

  // Shared fields
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    // User fields
    dateOfBirth: "", gender: "", country: "", city: "", timezone: "",
    nativeLanguage: "",
    learningLanguages: [{ language:"", level:"" }],
    interests: [], bio: "",
    // Admin fields
    adminPosition: "", adminNote: "",
  });

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const handleChange = e => set(e.target.name, e.target.value);

  useEffect(() => {
    if (isEdit) fetchUser();
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/users`);
      const user = res.data.find(u => u._id === id);
      if (user) {
        setRole(user.role || "user");
        setForm(f => ({
          ...f,
          name: user.name || "",
          email: user.email || "",
          adminPosition: user.adminPosition || "",
          adminNote: user.adminNote || "",
        }));
        // Also try to fetch profile
        try {
          const profileRes = await API.get(`/profile/${id}`);
          const p = profileRes.data;
          setForm(f => ({
            ...f,
            country: p.country || "",
            city: p.city || "",
            timezone: p.timezone || "",
            nativeLanguage: p.nativeLanguage || "",
            gender: p.gender || "",
            bio: p.bio || "",
            interests: p.interests || [],
            learningLanguages: p.languagesLearning?.length
              ? p.languagesLearning
              : [{ language:"", level:"" }],
          }));
        } catch {}
      }
    } catch {}
    finally { setLoading(false); }
  };

  const addLearningLang = () =>
    set("learningLanguages", [...form.learningLanguages, { language:"", level:"" }]);

  const updateLearningLang = (i, field, value) =>
    set("learningLanguages", form.learningLanguages.map((l, idx) =>
      idx === i ? { ...l, [field]: value } : l
    ));

  const removeLearningLang = (i) =>
    set("learningLanguages", form.learningLanguages.filter((_, idx) => idx !== i));

  const toggleInterest = (item) => {
    const cur = form.interests;
    set("interests", cur.includes(item) ? cur.filter(x => x !== item) : [...cur, item]);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) { setMessage("Name and email are required."); return; }
    if (!isEdit && (!form.password || form.password !== form.confirmPassword)) {
      setMessage("Passwords do not match."); return;
    }

    setSaving(true);
    setMessage("");
    try {
      if (isEdit) {
        await API.put(`/admin/users/${id}`, {
          name: form.name,
          email: form.email,
          role,
          adminPosition: form.adminPosition,
          adminNote: form.adminNote,
        });
        if (role === "user") {
          await API.put(`/admin/users/${id}/profile`, {
            country: form.country, city: form.city, timezone: form.timezone,
            nativeLanguage: form.nativeLanguage, gender: form.gender,
            bio: form.bio, interests: form.interests,
            languagesLearning: form.learningLanguages.filter(l => l.language),
          });
        }
        setMessage("User updated successfully!");
      } else {
        // Create new user
        const payload = {
          name: form.name, email: form.email,
          password: form.password, confirmPassword: form.confirmPassword,
          role,
          ...(role === "user" ? {
            dateOfBirth: form.dateOfBirth, gender: form.gender,
            country: form.country, city: form.city,
            timezone: form.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            nativeLanguage: form.nativeLanguage,
            learningLanguages: form.learningLanguages.filter(l => l.language),
            interests: form.interests, bio: form.bio,
          } : {
            adminPosition: form.adminPosition, adminNote: form.adminNote,
          }),
        };
        await API.post("/auth/register", payload);
        setMessage("User created successfully!");
        setTimeout(() => navigate("/admin/users"), 1000);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Save failed");
    } finally { setSaving(false); }
  };

  const visibleInterests = showAllInterests ? ALL_INTERESTS : ALL_INTERESTS.slice(0, 5);

  if (loading) return (
    <AdminLayout>
      <div style={{ textAlign:"center", padding:60, color:"#6b7fa3" }}>Loading...</div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <style>{`
        .aeu-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 28px;
        }
        .aeu-title { color: #1a2d6b; font-size: 22px; font-weight: 900; }

        .aeu-header-btns { display: flex; gap: 10px; }

        .aeu-cancel-btn {
          background: #e53e3e; border: none; border-radius: 10px;
          padding: 10px 22px; color: #fff;
          font-family: 'Nunito',sans-serif; font-size: 13px; font-weight: 800;
          cursor: pointer; transition: background 0.2s;
        }
        .aeu-cancel-btn:hover { background: #c53030; }

        .aeu-save-btn {
          background: #4a7fe0; border: none; border-radius: 10px;
          padding: 10px 22px; color: #fff;
          font-family: 'Nunito',sans-serif; font-size: 13px; font-weight: 800;
          cursor: pointer; transition: background 0.2s;
        }
        .aeu-save-btn:hover:not(:disabled) { background: #5a8ff0; }
        .aeu-save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Role selector */
        .aeu-role-bar {
          display: flex; gap: 10px; margin-bottom: 24px;
        }

        .aeu-role-btn {
          flex: 1; padding: 12px; border-radius: 12px;
          border: 2px solid rgba(26,45,107,0.15);
          background: #fff; color: #6b7fa3;
          font-family: 'Nunito',sans-serif; font-size: 14px; font-weight: 800;
          cursor: pointer; transition: all 0.2s; text-align: center;
        }
        .aeu-role-btn.active {
          border-color: #4a7fe0; background: #4a7fe0; color: #fff;
        }

        /* Avatar section */
        .aeu-avatar-section {
          display: flex; justify-content: center; margin-bottom: 28px;
        }

        .aeu-avatar-circle {
          width: 100px; height: 100px; border-radius: 50%;
          background: linear-gradient(135deg, #4a7fe0, #2a4a8f);
          display: flex; align-items: center; justify-content: center;
          font-size: 36px; font-weight: 800; color: #fff;
          border: 4px solid #fff;
          box-shadow: 0 4px 16px rgba(74,127,224,0.3);
          position: relative; cursor: pointer;
        }

        .aeu-avatar-edit {
          position: absolute; bottom: 0; right: 0;
          width: 28px; height: 28px; border-radius: 50%;
          background: #4a7fe0; display: flex; align-items: center; justify-content: center;
          font-size: 12px; border: 2px solid #fff;
        }

        /* Card */
        .aeu-card {
          background: #fff; border-radius: 20px;
          padding: 28px 32px; margin-bottom: 0;
          box-shadow: 0 2px 16px rgba(26,45,107,0.08);
        }

        /* Two col layout */
        .aeu-two-col {
          display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
        }

        @media (max-width: 768px) { .aeu-two-col { grid-template-columns: 1fr; } }

        /* Section title */
        .aeu-section-title {
          color: #1a2d6b; font-size: 15px; font-weight: 900;
          margin-bottom: 16px; padding-bottom: 8px;
          border-bottom: 2px solid #e8eef8;
        }

        /* Field */
        .aeu-field { margin-bottom: 14px; }
        .aeu-label { color: #6b7fa3; font-size: 12px; font-weight: 800; margin-bottom: 6px; display: block; text-transform: uppercase; letter-spacing: 0.5px; }

        .aeu-input-wrap { position: relative; }
        .aeu-input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #a0aec0; font-size: 14px; pointer-events: none; }

        .aeu-input {
          width: 100%;
          background: #f7f9fc;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 11px 14px 11px 38px;
          color: #1a2d6b; font-family: 'Nunito',sans-serif;
          font-size: 14px; font-weight: 600; outline: none;
          transition: border-color 0.2s;
        }
        .aeu-input.no-icon { padding-left: 14px; }
        .aeu-input:focus { border-color: #4a7fe0; background: #fff; }
        .aeu-input::placeholder { color: #a0aec0; }

        .aeu-pw-toggle {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #a0aec0; font-size: 14px;
        }

        .aeu-select {
          width: 100%; background: #f7f9fc;
          border: 1.5px solid #e2e8f0; border-radius: 12px;
          padding: 11px 14px; color: #1a2d6b;
          font-family: 'Nunito',sans-serif; font-size: 14px; font-weight: 600;
          outline: none; cursor: pointer; appearance: none;
          transition: border-color 0.2s;
        }
        .aeu-select:focus { border-color: #4a7fe0; }

        .aeu-select-wrap { position: relative; }
        .aeu-select-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #a0aec0; font-size: 12px; }

        /* Gender radios */
        .aeu-gender-row { display: flex; gap: 20px; }
        .aeu-gender-opt { display: flex; align-items: center; gap: 7px; cursor: pointer; color: #4a5568; font-size: 14px; font-weight: 600; }
        .aeu-gender-dot {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid #cbd5e0; background: transparent;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .aeu-gender-dot.sel { border-color: #4a7fe0; background: #4a7fe0; }
        .aeu-gender-dot.sel::after { content:''; width:6px; height:6px; border-radius:50%; background:#fff; }

        /* Language pairs */
        .aeu-lang-pair { display: flex; gap: 8px; align-items: center; margin-bottom: 10px; }
        .aeu-lang-pair .aeu-select-wrap { flex: 2; }
        .aeu-lang-pair .aeu-select-wrap.level { flex: 1.2; }

        .aeu-remove-btn {
          background: none; border: none; color: #f87171; font-size: 16px; cursor: pointer;
          padding: 4px; flex-shrink: 0;
        }

        .aeu-add-more-btn {
          width: 100%; background: #4a7fe0; border: none; border-radius: 10px;
          padding: 10px; color: #fff; font-family: 'Nunito',sans-serif;
          font-size: 13px; font-weight: 800; cursor: pointer; margin-top: 4px;
          transition: background 0.2s;
        }
        .aeu-add-more-btn:hover { background: #5a8ff0; }

        /* Interests */
        .aeu-interests-wrap { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
        .aeu-chip {
          background: #e8eef8; border: 1.5px solid #d1ddf0;
          border-radius: 20px; padding: 6px 14px;
          color: #4a5568; font-family: 'Nunito',sans-serif;
          font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .aeu-chip.sel { background: #4a7fe0; border-color: #4a7fe0; color: #fff; }

        .aeu-see-more {
          background: #f0f4fb; border: 1.5px solid #d1ddf0;
          border-radius: 20px; padding: 6px 14px;
          color: #a0aec0; font-family: 'Nunito',sans-serif;
          font-size: 12px; font-weight: 700; cursor: pointer;
        }

        /* Bio textarea */
        .aeu-textarea {
          width: 100%; background: #f7f9fc;
          border: 1.5px solid #e2e8f0; border-radius: 12px;
          padding: 12px 14px; color: #1a2d6b;
          font-family: 'Nunito',sans-serif; font-size: 14px; font-weight: 600;
          outline: none; resize: none; min-height: 100px; line-height: 1.6;
          transition: border-color 0.2s;
        }
        .aeu-textarea:focus { border-color: #4a7fe0; }

        /* Message */
        .aeu-msg { text-align: center; font-size: 13px; font-weight: 700; margin-top: 12px; }
        .aeu-msg.ok  { color: #4ade80; }
        .aeu-msg.err { color: #f87171; }

        /* Divider */
        .aeu-divider { height: 1px; background: #e8eef8; margin: 20px 0; }
      `}</style>

      {/* Header */}
      <div className="aeu-header">
        <h1 className="aeu-title">{isEdit ? "Edit User" : "Add New User"}</h1>
        <div className="aeu-header-btns">
          <button className="aeu-cancel-btn" onClick={() => navigate("/admin/users")}>Cancel</button>
          <button className="aeu-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Role selector */}
      {!isEdit && (
        <div className="aeu-role-bar">
          <button className={`aeu-role-btn ${role === "user" ? "active" : ""}`} onClick={() => setRole("user")}>
            👤 Regular User
          </button>
          <button className={`aeu-role-btn ${role === "admin" ? "active" : ""}`} onClick={() => setRole("admin")}>
            ⚙️ Administrator
          </button>
        </div>
      )}

      {/* Avatar */}
      <div className="aeu-avatar-section">
        <div className="aeu-avatar-circle">
          {form.name ? form.name.charAt(0).toUpperCase() : (role === "admin" ? "A" : "U")}
          <div className="aeu-avatar-edit">✏️</div>
        </div>
      </div>

      <div className="aeu-card">
        <div className="aeu-two-col">

          {/* ── LEFT COLUMN ── */}
          <div>
            {/* Account Information */}
            <p className="aeu-section-title">Account Information</p>

            <div className="aeu-field">
              <div className="aeu-input-wrap">
                <span className="aeu-input-icon">👤</span>
                <input className="aeu-input" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
              </div>
            </div>

            <div className="aeu-field">
              <div className="aeu-input-wrap">
                <span className="aeu-input-icon">✉</span>
                <input className="aeu-input" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
              </div>
            </div>

            {/* Username (handle) */}
            <div className="aeu-field">
              <div className="aeu-input-wrap">
                <span className="aeu-input-icon">@</span>
                <input className="aeu-input" name="username" placeholder="Username (optional)" value={form.username || ""} onChange={handleChange} />
              </div>
            </div>

            {!isEdit && (
              <>
                <div className="aeu-field">
                  <div className="aeu-input-wrap">
                    <span className="aeu-input-icon">🔒</span>
                    <input className="aeu-input" name="password" type={showPw ? "text" : "password"}
                      placeholder="Password" value={form.password} onChange={handleChange} />
                    <button className="aeu-pw-toggle" type="button" onClick={() => setShowPw(!showPw)}>{showPw ? "🙈" : "👁"}</button>
                  </div>
                </div>
                <div className="aeu-field">
                  <div className="aeu-input-wrap">
                    <span className="aeu-input-icon">🔒</span>
                    <input className="aeu-input" name="confirmPassword" type={showCpw ? "text" : "password"}
                      placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} />
                    <button className="aeu-pw-toggle" type="button" onClick={() => setShowCpw(!showCpw)}>{showCpw ? "🙈" : "👁"}</button>
                  </div>
                </div>
              </>
            )}

            {/* Admin-specific fields */}
            {role === "admin" ? (
              <>
                <div className="aeu-divider" />
                <p className="aeu-section-title">Admin Information</p>

                <div className="aeu-field">
                  <label className="aeu-label">Admin Position / Role</label>
                  <div className="aeu-select-wrap">
                    <select className="aeu-select" value={form.adminPosition} onChange={e => set("adminPosition", e.target.value)}>
                      <option value="">Select position</option>
                      {ADMIN_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <span className="aeu-select-arrow">▼</span>
                  </div>
                </div>

                <div className="aeu-field">
                  <label className="aeu-label">Admin Note (optional)</label>
                  <textarea
                    className="aeu-textarea"
                    placeholder="Notes about this admin's responsibilities..."
                    value={form.adminNote}
                    onChange={e => set("adminNote", e.target.value)}
                    style={{ minHeight: 80 }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="aeu-divider" />
                <p className="aeu-section-title">Personal Information</p>

                <div className="aeu-field">
                  <label className="aeu-label">Date of Birth</label>
                  <div className="aeu-input-wrap">
                    <span className="aeu-input-icon">📅</span>
                    <input className="aeu-input" name="dateOfBirth" type="date"
                      value={form.dateOfBirth} onChange={handleChange} style={{ colorScheme:"light" }} />
                  </div>
                </div>

                <div className="aeu-field">
                  <label className="aeu-label">Gender</label>
                  <div className="aeu-gender-row">
                    {["Male","Female","Other"].map(g => (
                      <label key={g} className="aeu-gender-opt" onClick={() => set("gender", g)}>
                        <div className={`aeu-gender-dot ${form.gender===g ? "sel" : ""}`} />{g}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="aeu-field">
                  <label className="aeu-label">Country</label>
                  <input className="aeu-input no-icon" name="country" placeholder="e.g. Thailand" value={form.country} onChange={handleChange} />
                </div>

                <div className="aeu-field">
                  <label className="aeu-label">City</label>
                  <input className="aeu-input no-icon" name="city" placeholder="e.g. Bangkok" value={form.city} onChange={handleChange} />
                </div>
              </>
            )}
          </div>

          {/* ── RIGHT COLUMN (user only) ── */}
          {role === "user" && (
            <div>
              <p className="aeu-section-title">Language</p>

              <div className="aeu-field">
                <label className="aeu-label">Native Language</label>
                <div className="aeu-select-wrap">
                  <select className="aeu-select" value={form.nativeLanguage} onChange={e => set("nativeLanguage", e.target.value)}>
                    <option value="">Select language</option>
                    {LANGUAGES.map(l => <option key={l} value={l}>{(LANG_FLAG[l] || "")} {l}</option>)}
                  </select>
                  <span className="aeu-select-arrow">▼</span>
                </div>
              </div>

              <div className="aeu-field">
                <label className="aeu-label">Learning Language</label>
                {form.learningLanguages.map((ll, i) => (
                  <div key={i} className="aeu-lang-pair">
                    <div className="aeu-select-wrap">
                      <select className="aeu-select" value={ll.language}
                        onChange={e => updateLearningLang(i, "language", e.target.value)}>
                        <option value="">Language</option>
                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <span className="aeu-select-arrow">▼</span>
                    </div>
                    <div className="aeu-select-wrap level">
                      <select className="aeu-select" value={ll.level}
                        onChange={e => updateLearningLang(i, "level", e.target.value)}>
                        <option value="">Level</option>
                        {LEVELS.map(lv => <option key={lv.value} value={lv.value}>{lv.label}</option>)}
                      </select>
                      <span className="aeu-select-arrow">▼</span>
                    </div>
                    {form.learningLanguages.length > 1 && (
                      <button className="aeu-remove-btn" onClick={() => removeLearningLang(i)}>×</button>
                    )}
                  </div>
                ))}
                <button className="aeu-add-more-btn" onClick={addLearningLang}>+ Add More</button>
              </div>

              <div className="aeu-divider" />

              <p className="aeu-section-title">
                Personal Interest
                <span style={{ fontSize:11, fontWeight:600, color:"#a0aec0", marginLeft:8 }}>
                  (Tap to choose)
                </span>
              </p>

              {/* Selected interests */}
              {form.interests.length > 0 && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
                  {form.interests.map(item => (
                    <span key={item} className="aeu-chip sel" onClick={() => toggleInterest(item)}>
                      ✓ {item}
                    </span>
                  ))}
                </div>
              )}

              <div className="aeu-interests-wrap">
                {visibleInterests.filter(i => !form.interests.includes(i)).map(item => (
                  <button key={item} className="aeu-chip" onClick={() => toggleInterest(item)}>
                    + {item}
                  </button>
                ))}
                {!showAllInterests && (
                  <button className="aeu-see-more" onClick={() => setShowAllInterests(true)}>See more +</button>
                )}
              </div>

              <div className="aeu-divider" />

              <p className="aeu-section-title">Bio</p>
              <textarea
                className="aeu-textarea"
                placeholder="Tell others about this user..."
                value={form.bio}
                onChange={e => set("bio", e.target.value)}
                maxLength={500}
              />
            </div>
          )}

          {/* Right col placeholder for admin */}
          {role === "admin" && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ textAlign:"center", color:"#a0aec0" }}>
                <div style={{ fontSize:64, marginBottom:12 }}>⚙️</div>
                <p style={{ fontSize:14, fontWeight:700 }}>Administrator Account</p>
                <p style={{ fontSize:12, marginTop:4 }}>Fill in account info and position on the left</p>
              </div>
            </div>
          )}
        </div>

        {message && (
          <p className={`aeu-msg ${message.includes("success") ? "ok" : "err"}`}>{message}</p>
        )}
      </div>
    </AdminLayout>
  );
}