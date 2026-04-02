import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import PhoneFrame from "../components/PhoneFrame";

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
  "Exercise","Movie","Podcast","Book","Food","Music","Travel",
  "Gaming","Art","Fashion","Tech","Sports","Photography","Cooking",
  "Dance","Nature","Anime","Reading",
];

const FieldInput = ({ icon, rightEl, ...props }) => (
  <div className="relative mb-3.5">
    {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35 text-[15px] pointer-events-none">{icon}</span>}
    <input
      className={`w-full bg-white/12 border border-white/10 rounded-2xl py-3.5 ${icon ? "pl-11" : "pl-4"} ${rightEl ? "pr-11" : "pr-4"}
        text-white text-sm font-semibold outline-none placeholder:text-white/30
        focus:border-white/35 focus:bg-white/16 transition-all`}
      {...props}
    />
    {rightEl}
  </div>
);

const PwToggle = ({ show, toggle }) => (
  <button type="button" onClick={toggle}
    className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-0 text-white/40 text-sm cursor-pointer">
    {show ? "🙈" : "👁"}
  </button>
);

export default function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [message, setMessage] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const [form, setForm] = useState({
    name:"", email:"", password:"", confirmPassword:"",
    dateOfBirth:"", gender:"", country:"", city:"",
    nativeLanguage:"",
    learningLanguages:[{ language:"", level:"" }],
    interests:[], bio:"",
  });

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, meRes] = await Promise.all([
          API.get("/profile"),
          API.get("/auth/me"),
        ]);
        const p  = profileRes.data.profile || profileRes.data;
        const me = meRes.data;
        setForm(f => ({
          ...f,
          name: me.name || "",
          email: me.email || "",
          dateOfBirth: p.dateOfBirth?.slice(0,10) || "",
          gender: p.gender || "",
          country: p.country || "",
          city: p.city || "",
          nativeLanguage: p.nativeLanguage || "",
          learningLanguages: p.languagesLearning?.length
            ? p.languagesLearning
            : [{ language:"", level:"" }],
          interests: p.interests || [],
          bio: p.bio || "",
        }));
      } catch {}
      finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const addLearningLanguage    = () => set("learningLanguages", [...form.learningLanguages, { language:"", level:"" }]);
  const removeLearningLanguage = (i) => set("learningLanguages", form.learningLanguages.filter((_,idx) => idx !== i));
  const updateLearningLanguage = (i, field, value) =>
    set("learningLanguages", form.learningLanguages.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  const toggleInterest = (item) =>
    set("interests", form.interests.includes(item) ? form.interests.filter(x => x !== item) : [...form.interests, item]);

  const handleSave = async () => {
    if (form.password && form.password !== form.confirmPassword) {
      setMessage("Passwords do not match."); return;
    }
    setSaving(true); setMessage("");
    try {
      // ── 1. Update name (+ password ถ้ามี) ที่ User model ──
      const accountPayload = { name: form.name };
      if (form.password) accountPayload.password = form.password;
      await API.put("/auth/me", accountPayload);

      // ── 2. Update Profile ──
      await API.put("/profile", {
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender,
        country: form.country,
        city: form.city,
        nativeLanguage: form.nativeLanguage,
        languagesLearning: form.learningLanguages.filter(l => l.language),
        interests: form.interests,
        bio: form.bio,
      });

      // ── 3. Update localStorage ──
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, name: form.name }));

      setMessage("Profile updated!");
      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    } finally { setSaving(false); }
  };

  if (loading) return (
    <PhoneFrame>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white/50 text-base">Loading...</div>
      </div>
    </PhoneFrame>
  );

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0f1c3f] px-4 py-4 flex items-center gap-3 border-b border-white/[0.06]">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/10 border-0 text-white text-lg cursor-pointer flex items-center justify-center hover:bg-white/15 transition-colors">
            ←
          </button>
          <h1 className="text-white text-lg font-black flex-1">Edit Profile</h1>
          <button onClick={handleSave} disabled={saving}
            className="bg-[#4a7fe0] border-0 rounded-full px-5 py-2 text-white text-sm font-extrabold cursor-pointer
              hover:bg-[#5a8ff0] disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        <div className="px-5 py-6 space-y-6">

          {/* ── Account Info ── */}
          <div>
            <h2 className="text-white text-base font-black mb-4 pb-2 border-b border-white/10">Account Information</h2>

            <label className="block text-white/70 text-[13px] font-bold mb-2">Full Name</label>
            <FieldInput icon="👤" placeholder="Full Name" value={form.name}
              onChange={e => set("name", e.target.value)} />

            <label className="block text-white/70 text-[13px] font-bold mb-2">Email</label>
            <FieldInput icon="✉" type="email" placeholder="Email" value={form.email}
              onChange={e => set("email", e.target.value)} />

            <label className="block text-white/70 text-[13px] font-bold mb-2">
              New Password{" "}
              <span className="text-white/30 font-semibold">(leave blank to keep current)</span>
            </label>
            <FieldInput icon="🔒" type={showPw ? "text" : "password"} placeholder="New Password"
              value={form.password} onChange={e => set("password", e.target.value)}
              rightEl={<PwToggle show={showPw} toggle={() => setShowPw(!showPw)} />} />

            <label className="block text-white/70 text-[13px] font-bold mb-2">Confirm Password</label>
            <FieldInput icon="🔒" type={showCpw ? "text" : "password"} placeholder="Confirm Password"
              value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)}
              rightEl={<PwToggle show={showCpw} toggle={() => setShowCpw(!showCpw)} />} />
          </div>

          {/* ── Personal Info ── */}
          <div>
            <h2 className="text-white text-base font-black mb-4 pb-2 border-b border-white/10">Personal Information</h2>

            <label className="block text-white/70 text-[13px] font-bold mb-2">Date of Birth</label>
            <FieldInput icon="📅" type="date" value={form.dateOfBirth}
              onChange={e => set("dateOfBirth", e.target.value)} style={{ colorScheme:"dark" }} />

            <label className="block text-white/70 text-[13px] font-bold mb-2">Gender</label>
            <div className="flex gap-5 mb-3.5">
              {["Male","Female","Other"].map(g => (
                <label key={g} onClick={() => set("gender", g)}
                  className="flex items-center gap-1.5 cursor-pointer text-white/75 text-sm font-semibold">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                    ${form.gender === g ? "border-[#4a7fe0] bg-[#4a7fe0]" : "border-white/35 bg-transparent"}`}>
                    {form.gender === g && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  {g}
                </label>
              ))}
            </div>

            <label className="block text-white/70 text-[13px] font-bold mb-2">Country</label>
            <FieldInput placeholder="e.g. Thailand" value={form.country}
              onChange={e => set("country", e.target.value)} />

            <label className="block text-white/70 text-[13px] font-bold mb-2">City</label>
            <FieldInput placeholder="e.g. Bangkok" value={form.city}
              onChange={e => set("city", e.target.value)} />
          </div>

          {/* ── Language ── */}
          <div>
            <h2 className="text-white text-base font-black mb-4 pb-2 border-b border-white/10">Language</h2>

            <label className="block text-white/70 text-[13px] font-bold mb-2">Native Language</label>
            <div className="relative mb-3.5">
              <select value={form.nativeLanguage} onChange={e => set("nativeLanguage", e.target.value)}
                className="w-full bg-white/12 border border-white/10 rounded-2xl py-3.5 pl-4 pr-9
                  text-white text-sm font-semibold outline-none appearance-none cursor-pointer
                  focus:border-white/35 focus:bg-white/16 transition-all"
                style={{ colorScheme:"dark" }}>
                <option value="">Select your language</option>
                {LANGUAGES.map(l => <option key={l} value={l} style={{ background:"#1a2d6b" }}>{l}</option>)}
              </select>
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 text-xs pointer-events-none">▼</span>
            </div>

            <label className="block text-white/70 text-[13px] font-bold mb-2">Learning Language</label>
            {form.learningLanguages.map((ll, i) => (
              <div key={i} className="flex gap-2 items-center mb-2.5">
                <div className="flex-[2] relative">
                  <select value={ll.language} onChange={e => updateLearningLanguage(i,"language",e.target.value)}
                    className="w-full bg-white/12 border border-white/10 rounded-2xl py-3.5 pl-4 pr-8
                      text-white text-sm font-semibold outline-none appearance-none cursor-pointer
                      focus:border-white/35 transition-all"
                    style={{ colorScheme:"dark" }}>
                    <option value="">Language</option>
                    {LANGUAGES.map(l => <option key={l} value={l} style={{ background:"#1a2d6b" }}>{l}</option>)}
                  </select>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 text-xs pointer-events-none">▼</span>
                </div>
                <div className="flex-[1.5] relative">
                  <select value={ll.level} onChange={e => updateLearningLanguage(i,"level",e.target.value)}
                    className="w-full bg-white/12 border border-white/10 rounded-2xl py-3.5 pl-4 pr-8
                      text-white text-sm font-semibold outline-none appearance-none cursor-pointer
                      focus:border-white/35 transition-all"
                    style={{ colorScheme:"dark" }}>
                    <option value="">Level</option>
                    {LEVELS.map(lv => <option key={lv.value} value={lv.value} style={{ background:"#1a2d6b" }}>{lv.label}</option>)}
                  </select>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 text-xs pointer-events-none">▼</span>
                </div>
                {form.learningLanguages.length > 1 && (
                  <button onClick={() => removeLearningLanguage(i)}
                    className="bg-transparent border-0 text-red-400 text-xl cursor-pointer p-1 shrink-0 hover:text-red-300 transition-colors">×</button>
                )}
              </div>
            ))}
            <button onClick={addLearningLanguage}
              className="w-full bg-[#4a7fe0] border-0 rounded-xl py-3 text-white text-sm font-extrabold cursor-pointer hover:bg-[#5a8ff0] transition-colors">
              + Add More
            </button>
          </div>

          {/* ── Interests ── */}
          <div>
            <h2 className="text-white text-base font-black mb-1.5 pb-2 border-b border-white/10">Personal Interest</h2>
            <p className="text-white/40 text-xs font-semibold mb-3">Tap to choose your interests</p>
            <div className="flex flex-wrap gap-2">
              {ALL_INTERESTS.map(item => (
                <button key={item} type="button" onClick={() => toggleInterest(item)}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] font-bold border cursor-pointer transition-all
                    ${form.interests.includes(item)
                      ? "bg-[#4a7fe0] border-[#4a7fe0] text-white"
                      : "bg-white/10 border-white/15 text-white/65 hover:bg-white/16"
                    }`}>
                  {form.interests.includes(item) ? "✓" : "+"} {item}
                </button>
              ))}
            </div>
          </div>

          {/* ── Bio ── */}
          <div>
            <h2 className="text-white text-base font-black mb-3 pb-2 border-b border-white/10">Bio</h2>
            <textarea placeholder="Tell others about yourself..." value={form.bio}
              onChange={e => set("bio", e.target.value)} maxLength={500}
              className="w-full bg-white/12 border border-white/10 rounded-2xl py-3.5 px-4
                text-white text-sm font-semibold outline-none resize-none min-h-[100px]
                placeholder:text-white/30 focus:border-white/35 focus:bg-white/16 transition-all" />
            <p className="text-white/25 text-xs font-semibold text-right mt-1">{form.bio.length}/500</p>
          </div>

          {/* Message */}
          {message && (
            <p className={`text-center text-[13px] font-bold ${message.includes("updated") ? "text-[#7effa8]" : "text-[#ff8fa3]"}`}>
              {message}
            </p>
          )}

          {/* Bottom save */}
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-[#4a7fe0] border-0 rounded-2xl py-4 text-white text-[15px] font-extrabold cursor-pointer
              shadow-[0_6px_20px_rgba(74,127,224,0.4)] hover:bg-[#5a8ff0]
              disabled:opacity-60 disabled:cursor-not-allowed transition-all mb-4">
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </div>
      </div>
    </PhoneFrame>
  );
}