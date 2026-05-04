import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import API from "../../api/api";
import { getAvatarUrl } from "../../utils/avatarUrl";


const LANGUAGES = [
  "English","Thai","Japanese","Korean","Chinese (Mandarin)","Chinese (Cantonese)",
  "French","German","Spanish","Italian","Portuguese","Arabic","Hindi","Russian",
  "Vietnamese","Indonesian","Malay","Dutch","Swedish","Polish",
];
const LEVELS = [
  { label:"A1 – Beginner", value:"A1" },{ label:"A2 – Elementary", value:"A2" },
  { label:"B1 – Intermediate", value:"B1" },{ label:"B2 – Upper-Intermediate", value:"B2" },
  { label:"C1 – Advanced", value:"C1" },{ label:"C2 – Native/Mastery", value:"C2" },
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
  English:"🇬🇧",Thai:"🇹🇭",Japanese:"🇯🇵",Korean:"🇰🇷",
  "Chinese (Mandarin)":"🇨🇳",French:"🇫🇷",German:"🇩🇪",
  Spanish:"🇪🇸",Italian:"🇮🇹",Portuguese:"🇵🇹",
};

/* ── Reusable inputs ── */
const Field = ({ label, children }) => (
  <div className="mb-3.5">
    {label && <label className="block text-[#6b7fa3] text-[11px] font-extrabold uppercase tracking-wider mb-1.5">{label}</label>}
    {children}
  </div>
);

const Input = ({ icon, right, className = "", ...props }) => (
  <div className="relative">
    {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0aec0] text-sm pointer-events-none">{icon}</span>}
    <input
      className={`w-full bg-[#f7f9fc] border border-[#e2e8f0] rounded-xl py-3 ${icon ? "pl-10" : "pl-3.5"} ${right ? "pr-10" : "pr-3.5"}
        text-[#1a2d6b] text-sm font-semibold outline-none placeholder:text-[#a0aec0]
        focus:border-[#4a7fe0] focus:bg-white transition-all ${className}`}
      {...props}
    />
    {right}
  </div>
);

const Select = ({ label, value, onChange, options, placeholder }) => (
  <Field label={label}>
    <div className="relative">
      <select value={value} onChange={onChange}
        className="w-full bg-[#f7f9fc] border border-[#e2e8f0] rounded-xl py-3 pl-3.5 pr-9
          text-[#1a2d6b] text-sm font-semibold outline-none appearance-none cursor-pointer
          focus:border-[#4a7fe0] focus:bg-white transition-all">
        <option value="">{placeholder || "Select..."}</option>
        {options.map(o => typeof o === "string"
          ? <option key={o} value={o}>{(LANG_FLAG[o]||"")} {o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>
        )}
      </select>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0aec0] text-xs pointer-events-none">▼</span>
    </div>
  </Field>
);

const SectionTitle = ({ children }) => (
  <h3 className="text-[#1a2d6b] text-[15px] font-black mb-4 pb-2 border-b-2 border-[#e8eef8]">{children}</h3>
);

export default function AdminAddEditUser() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = !!id;

  const [role, setRole]     = useState("user");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [message, setMessage] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [showAllInterests, setShowAllInterests] = useState(false);

  const [form, setForm] = useState({
    name:"", email:"", password:"", confirmPassword:"", username:"",
    dateOfBirth:"", gender:"", country:"", city:"", timezone:"",
    nativeLanguage:"", learningLanguages:[{ language:"", level:"" }],
    interests:[], bio:"", adminPosition:"", adminNote:"",
  });

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const handleChange = e => set(e.target.name, e.target.value);

  useEffect(() => { if (isEdit) fetchUser(); }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res  = await API.get("/admin/users");
      const user = res.data.find(u => u._id === id);
      if (user) {
        setRole(user.role || "user");
        setForm(f => ({ ...f, name: user.name||"", email: user.email||"",
          adminPosition: user.adminPosition||"", adminNote: user.adminNote||"" }));
        try {
          const p = (await API.get(`/profile/${id}`)).data;
          setForm(f => ({ ...f, country:p.country||"", city:p.city||"", timezone:p.timezone||"",
            nativeLanguage:p.nativeLanguage||"", gender:p.gender||"", bio:p.bio||"",
            interests:p.interests||[],
            learningLanguages: p.languagesLearning?.length ? p.languagesLearning : [{ language:"", level:"" }],
          }));
        } catch {}
      }
    } catch {} finally { setLoading(false); }
  };

  const addLearningLang    = () => set("learningLanguages", [...form.learningLanguages, { language:"", level:"" }]);
  const removeLearningLang = i  => set("learningLanguages", form.learningLanguages.filter((_,idx) => idx !== i));
  const updateLearningLang = (i, field, value) =>
    set("learningLanguages", form.learningLanguages.map((l,idx) => idx===i ? { ...l,[field]:value } : l));
  const toggleInterest = item =>
    set("interests", form.interests.includes(item) ? form.interests.filter(x=>x!==item) : [...form.interests, item]);

  const handleSave = async () => {
    if (!form.name || !form.email) { setMessage("Name and email are required."); return; }
    if (!isEdit && (!form.password || form.password !== form.confirmPassword)) {
      setMessage("Passwords do not match."); return;
    }
    setSaving(true); setMessage("");
    try {
      if (isEdit) {
        await API.put(`/admin/users/${id}`, { name:form.name, email:form.email, role, adminPosition:form.adminPosition, adminNote:form.adminNote });
        if (role === "user") await API.put(`/admin/users/${id}/profile`, {
          country:form.country, city:form.city, timezone:form.timezone,
          nativeLanguage:form.nativeLanguage, gender:form.gender, bio:form.bio,
          interests:form.interests, languagesLearning:form.learningLanguages.filter(l=>l.language),
        });
        setMessage("User updated successfully!");
      } else {
        await API.post("/auth/register", {
          name:form.name, email:form.email, password:form.password, confirmPassword:form.confirmPassword, role,
          ...(role==="user" ? {
            dateOfBirth:form.dateOfBirth, gender:form.gender, country:form.country, city:form.city,
            timezone:form.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone,
            nativeLanguage:form.nativeLanguage,
            learningLanguages:form.learningLanguages.filter(l=>l.language),
            interests:form.interests, bio:form.bio,
          } : { adminPosition:form.adminPosition, adminNote:form.adminNote }),
        });
        setMessage("User created successfully!");
        setTimeout(() => navigate("/admin/users"), 1000);
      }
    } catch (err) { setMessage(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const visibleInterests = showAllInterests ? ALL_INTERESTS : ALL_INTERESTS.slice(0, 5);

  if (loading) return <AdminLayout><div className="text-center py-16 text-[#6b7fa3]">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <h1 className="text-[#1a2d6b] text-2xl font-black">{isEdit ? "Edit User" : "Add New User"}</h1>
        <div className="flex gap-2.5">
          <button onClick={() => navigate("/admin/users")}
            className="bg-red-500 border-0 rounded-xl px-5 py-2.5 text-white text-sm font-extrabold cursor-pointer hover:bg-red-600 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="bg-[#4a7fe0] border-0 rounded-xl px-5 py-2.5 text-white text-sm font-extrabold cursor-pointer hover:bg-[#5a8ff0] disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Role selector */}
      {!isEdit && (
        <div className="flex gap-2.5 mb-6">
          {[{ val:"user", icon:"👤", label:"Regular User" },{ val:"admin", icon:"⚙️", label:"Administrator" }].map(r => (
            <button key={r.val} onClick={() => setRole(r.val)}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-extrabold cursor-pointer transition-all
                ${role === r.val ? "bg-[#4a7fe0] border-[#4a7fe0] text-white" : "bg-white border-[#e2e8f0] text-[#6b7fa3] hover:border-[#4a7fe0]"}`}>
              {r.icon} {r.label}
            </button>
          ))}
        </div>
      )}

      {/* Avatar */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <img
            src={getAvatarUrl(null, id || "new", form.gender)}
            alt=""
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-[0_4px_16px_rgba(74,127,224,0.3)]"
          />
          <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#4a7fe0] border-2 border-white flex items-center justify-center text-xs">✏️</div>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl p-7 shadow-[0_2px_16px_rgba(26,45,107,0.08)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* ── LEFT ── */}
          <div>
            <SectionTitle>Account Information</SectionTitle>

            <Field>
              <Input icon="👤" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
            </Field>
            <Field>
              <Input icon="✉" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
            </Field>
            <Field>
              <Input icon="@" name="username" placeholder="Username (optional)" value={form.username||""} onChange={handleChange} />
            </Field>

            {!isEdit && (
              <>
                <Field>
                  <Input icon="🔒" name="password" type={showPw?"text":"password"} placeholder="Password"
                    value={form.password} onChange={handleChange}
                    right={
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-0 text-[#a0aec0] text-sm cursor-pointer">
                        {showPw?"🙈":"👁"}
                      </button>
                    }
                  />
                </Field>
                <Field>
                  <Input icon="🔒" name="confirmPassword" type={showCpw?"text":"password"} placeholder="Confirm Password"
                    value={form.confirmPassword} onChange={handleChange}
                    right={
                      <button type="button" onClick={() => setShowCpw(!showCpw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-0 text-[#a0aec0] text-sm cursor-pointer">
                        {showCpw?"🙈":"👁"}
                      </button>
                    }
                  />
                </Field>
              </>
            )}

            <div className="h-px bg-[#e8eef8] my-5" />

            {role === "admin" ? (
              <>
                <SectionTitle>Admin Information</SectionTitle>
                <Select label="Admin Position / Role" value={form.adminPosition}
                  onChange={e => set("adminPosition", e.target.value)}
                  options={ADMIN_POSITIONS} placeholder="Select position" />
                <Field label="Admin Note (optional)">
                  <textarea placeholder="Notes about this admin's responsibilities..."
                    value={form.adminNote} onChange={e => set("adminNote", e.target.value)}
                    className="w-full bg-[#f7f9fc] border border-[#e2e8f0] rounded-xl py-3 px-3.5 text-[#1a2d6b] text-sm font-semibold outline-none resize-none min-h-[80px] placeholder:text-[#a0aec0] focus:border-[#4a7fe0] focus:bg-white transition-all" />
                </Field>
              </>
            ) : (
              <>
                <SectionTitle>Personal Information</SectionTitle>
                <Field label="Date of Birth">
                  <Input icon="📅" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
                </Field>
                <Field label="Gender">
                  <div className="flex gap-5">
                    {["Male","Female","Other"].map(g => (
                      <label key={g} onClick={() => set("gender", g)}
                        className="flex items-center gap-1.5 cursor-pointer text-[#4a5568] text-sm font-semibold">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                          ${form.gender===g ? "border-[#4a7fe0] bg-[#4a7fe0]" : "border-[#cbd5e0] bg-transparent"}`}>
                          {form.gender===g && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        {g}
                      </label>
                    ))}
                  </div>
                </Field>
                <Field label="Country">
                  <Input name="country" placeholder="e.g. Thailand" value={form.country} onChange={handleChange} />
                </Field>
                <Field label="City">
                  <Input name="city" placeholder="e.g. Bangkok" value={form.city} onChange={handleChange} />
                </Field>
              </>
            )}
          </div>

          {/* ── RIGHT ── */}
          {role === "user" ? (
            <div>
              <SectionTitle>Language</SectionTitle>

              <Select label="Native Language" value={form.nativeLanguage}
                onChange={e => set("nativeLanguage", e.target.value)}
                options={LANGUAGES} placeholder="Select language" />

              <Field label="Learning Language">
                {form.learningLanguages.map((ll, i) => (
                  <div key={i} className="flex gap-2 items-center mb-2">
                    <div className="flex-[2] relative">
                      <select value={ll.language} onChange={e => updateLearningLang(i,"language",e.target.value)}
                        className="w-full bg-[#f7f9fc] border border-[#e2e8f0] rounded-xl py-3 pl-3.5 pr-8 text-[#1a2d6b] text-sm font-semibold outline-none appearance-none cursor-pointer focus:border-[#4a7fe0] transition-all">
                        <option value="">Language</option>
                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a0aec0] text-xs pointer-events-none">▼</span>
                    </div>
                    <div className="flex-[1.2] relative">
                      <select value={ll.level} onChange={e => updateLearningLang(i,"level",e.target.value)}
                        className="w-full bg-[#f7f9fc] border border-[#e2e8f0] rounded-xl py-3 pl-3.5 pr-8 text-[#1a2d6b] text-sm font-semibold outline-none appearance-none cursor-pointer focus:border-[#4a7fe0] transition-all">
                        <option value="">Level</option>
                        {LEVELS.map(lv => <option key={lv.value} value={lv.value}>{lv.label}</option>)}
                      </select>
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a0aec0] text-xs pointer-events-none">▼</span>
                    </div>
                    {form.learningLanguages.length > 1 && (
                      <button onClick={() => removeLearningLang(i)}
                        className="bg-transparent border-0 text-red-400 text-lg cursor-pointer p-1 shrink-0 hover:text-red-500 transition-colors">×</button>
                    )}
                  </div>
                ))}
                <button onClick={addLearningLang}
                  className="w-full bg-[#4a7fe0] border-0 rounded-xl py-2.5 text-white text-sm font-extrabold cursor-pointer mt-1 hover:bg-[#5a8ff0] transition-colors">
                  + Add More
                </button>
              </Field>

              <div className="h-px bg-[#e8eef8] my-5" />

              <SectionTitle>Personal Interest <span className="text-[11px] font-semibold text-[#a0aec0] ml-2">(Tap to choose)</span></SectionTitle>

              {form.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.interests.map(item => (
                    <button key={item} onClick={() => toggleInterest(item)}
                      className="bg-[#4a7fe0] border border-[#4a7fe0] rounded-full px-3.5 py-1.5 text-white text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity">
                      ✓ {item}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-2">
                {visibleInterests.filter(i => !form.interests.includes(i)).map(item => (
                  <button key={item} onClick={() => toggleInterest(item)}
                    className="bg-[#e8eef8] border border-[#d1ddf0] rounded-full px-3.5 py-1.5 text-[#4a5568] text-xs font-bold cursor-pointer hover:bg-[#d1ddf0] transition-colors">
                    + {item}
                  </button>
                ))}
                {!showAllInterests && (
                  <button onClick={() => setShowAllInterests(true)}
                    className="bg-[#f0f4fb] border border-[#d1ddf0] rounded-full px-3.5 py-1.5 text-[#a0aec0] text-xs font-bold cursor-pointer">
                    See more +
                  </button>
                )}
              </div>

              <div className="h-px bg-[#e8eef8] my-5" />

              <SectionTitle>Bio</SectionTitle>
              <textarea placeholder="Tell others about this user..." value={form.bio}
                onChange={e => set("bio", e.target.value)} maxLength={500}
                className="w-full bg-[#f7f9fc] border border-[#e2e8f0] rounded-xl py-3 px-3.5 text-[#1a2d6b] text-sm font-semibold outline-none resize-none min-h-[100px] leading-relaxed placeholder:text-[#a0aec0] focus:border-[#4a7fe0] focus:bg-white transition-all" />
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="text-center text-[#a0aec0]">
                <div className="text-7xl mb-4">⚙️</div>
                <p className="text-sm font-bold">Administrator Account</p>
                <p className="text-xs mt-1">Fill in account info and position on the left</p>
              </div>
            </div>
          )}
        </div>

        {/* Message */}
        {message && (
          <p className={`text-center text-[13px] font-bold mt-4 ${message.includes("success") ? "text-green-400" : "text-red-400"}`}>
            {message}
          </p>
        )}
      </div>
    </AdminLayout>
  );
}