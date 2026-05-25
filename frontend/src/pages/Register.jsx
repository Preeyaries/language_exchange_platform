import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import PhoneFrame from "../components/PhoneFrame";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

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

/* ── Reusable sub-components ── */
const RegInput = ({ icon, children, ...props }) => (
  <div className="relative mb-3.5">
    {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35 text-[15px] pointer-events-none">{icon}</span>}
    <input
      className={`w-full bg-white/12 border border-white/10 rounded-2xl py-3.5 ${icon ? "pl-11" : "pl-4"} pr-4
        text-white text-sm font-semibold outline-none placeholder:text-white/30
        focus:border-white/35 focus:bg-white/16 transition-all`}
      {...props}
    />
    {children}
  </div>
);

const RegSelect = ({ label, value, onChange, options, placeholder }) => (
  <div className="relative mb-3.5">
    {label && <label className="block text-white/70 text-[13px] font-bold mb-2">{label}</label>}
    <div className="relative">
      <select value={value} onChange={onChange}
        className="w-full bg-white/12 border border-white/10 rounded-2xl py-3.5 pl-4 pr-9
          text-white text-sm font-semibold outline-none appearance-none cursor-pointer
          focus:border-white/35 focus:bg-white/16 transition-all"
        style={{ colorScheme:"dark" }}>
        <option value="">{placeholder || "Select..."}</option>
        {options.map(o => typeof o === "string"
          ? <option key={o} value={o} style={{ background:"#1a2d6b" }}>{o}</option>
          : <option key={o.value} value={o.value} style={{ background:"#1a2d6b" }}>{o.label}</option>
        )}
      </select>
      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 text-xs pointer-events-none">▼</span>
    </div>
  </div>
);

function Register() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const [form, setForm] = useState({
    name:"", email:"", password:"", confirmPassword:"",
    dateOfBirth:"", gender:"", country:"", city:"",
    nativeLanguage:"", learningLanguages:[{ language:"", level:"" }],
    interests:[], bio:"",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  });

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const handleChange = (e) => set(e.target.name, e.target.value);

  const validateStep1 = () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) { setMessage("Please fill in all fields."); return false; }
    if (form.password !== form.confirmPassword) { setMessage("Passwords do not match."); return false; }
    setMessage(""); return true;
  };

  const validateStep2 = () => {
    if (!form.dateOfBirth || !form.gender) { setMessage("Please fill in Date of Birth and Gender."); return false; }
    setMessage(""); return true;
  };

  const addLearningLanguage = () => set("learningLanguages", [...form.learningLanguages, { language:"", level:"" }]);

  const updateLearningLanguage = (index, field, value) =>
    set("learningLanguages", form.learningLanguages.map((l, i) => i === index ? { ...l, [field]: value } : l));

  const toggleInterest = (item) =>
    set("interests", form.interests.includes(item) ? form.interests.filter(i => i !== item) : [...form.interests, item]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await API.post("/auth/register", {
        ...form, learningLanguages: form.learningLanguages.filter(l => l.language),
      });
      setMessage(res.data.message || "Registered successfully!");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || "Register failed");
    } finally { setLoading(false); }
  };

  const PrimaryBtn = ({ onClick, disabled, children }) => (
    <button onClick={onClick} disabled={disabled}
      className="w-full bg-[#4a7fe0] border-0 rounded-2xl py-4 text-white text-[15px] font-extrabold tracking-wide cursor-pointer mt-1
        shadow-[0_6px_20px_rgba(74,127,224,0.4)] hover:bg-[#5a8ff0] hover:-translate-y-px active:translate-y-0
        disabled:opacity-70 disabled:cursor-not-allowed transition-all">
      {children}
    </button>
  );

  const BackBtn = ({ onClick }) => (
    <p className="text-center mt-4">
      <button onClick={onClick} className="bg-transparent border-0 text-white/45 text-[13px] font-bold cursor-pointer">← Back</button>
    </p>
  );

  return (
    <PhoneFrame>
      <div className="flex-1 flex items-center justify-center px-5 py-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        {/* Card */}
        <div className="w-full rounded-[36px] px-9 py-12
          bg-gradient-to-br from-[#1a3575] via-[#1a2d6b] to-[#162860]
          ,inset_0_1px_0_rgba(255,255,255,0.08)]">

            {/* Step dots */}
            <div className="flex justify-center gap-2 mb-7">
              {[1,2,3].map(s => (
                <div key={s} className={`h-2 rounded-full transition-all duration-300
                  ${s === step ? "w-6 bg-[#4a7fe0]" : s < step ? "w-2 bg-white/50" : "w-2 bg-white/20"}`} />
              ))}
            </div>

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <>
                <h2 className="text-white text-[28px] font-extrabold tracking-tight mb-1">SIGN UP</h2>
                <p className="text-white/60 text-[13px] font-bold uppercase tracking-wide mb-5">Account Information</p>

                <RegInput icon="👤" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
                <RegInput icon="✉" name="email" type="email" placeholder="Your Email" value={form.email} onChange={handleChange} />
                <RegInput icon="🔒" name="password" type={showPw?"text":"password"} placeholder="Password" value={form.password} onChange={handleChange}>
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-0 text-white/40 text-sm cursor-pointer">
                    {showPw?"🙈":"👁"}
                  </button>
                </RegInput>
                <RegInput icon="🔒" name="confirmPassword" type={showCpw?"text":"password"} placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange}>
                  <button type="button" onClick={() => setShowCpw(!showCpw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-0 text-white/40 text-sm cursor-pointer">
                    {showCpw?"🙈":"👁"}
                  </button>
                </RegInput>

                {message && <p className="text-center text-[#ff8fa3] text-[13px] font-bold mt-2.5">{message}</p>}

                <div className="mt-4"><PrimaryBtn onClick={() => { if (validateStep1()) setStep(2); }}>Next</PrimaryBtn></div>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-white/12" />
                  <span className="text-white/40 text-xs font-bold whitespace-nowrap">Or continue with</span>
                  <div className="flex-1 h-px bg-white/12" />
                </div>

                {/* Social */}
                <div className="flex justify-center gap-3.5 mb-5">
                  <button disabled className="w-12 h-12 rounded-full bg-white/10 border border-white/12 flex items-center justify-center opacity-50 p-0 cursor-default">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </button>
                  {[
                    { title:"Google", onClick:() => { window.location.href=`${BACKEND_URL}/api/auth/google`; }, svg:<svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> },
                    { title:"Facebook", onClick:() => { window.location.href=`${BACKEND_URL}/api/auth/facebook`; }, svg:<svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
                    { title:"Apple", onClick:() => { window.location.href=`${BACKEND_URL}/api/auth/apple`; }, svg:<svg viewBox="0 0 24 24" className="w-5 h-5" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg> },
                  ].map(s => (
                    <button key={s.title} type="button" onClick={s.onClick} title={s.title}
                      className="w-12 h-12 rounded-full bg-white/10 border border-white/12 flex items-center justify-center cursor-pointer p-0 hover:bg-white/18 hover:-translate-y-0.5 transition-all">
                      {s.svg}
                    </button>
                  ))}
                </div>

                <p className="text-center text-white/35 text-xs font-semibold mb-3.5">
                  By registering you with our <a href="#" className="text-white/55 underline">Terms and Conditions</a>
                </p>
                <p className="text-center text-white/45 text-[13px] font-semibold">
                  Already have an account? <Link to="/login" className="text-white font-extrabold no-underline hover:underline">Log in →</Link>
                </p>
              </>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <>
                <h2 className="text-white text-[28px] font-extrabold tracking-tight mb-5">Personal Information</h2>

                <label className="block text-white/70 text-[13px] font-bold mb-2">Date of Birth</label>
                <RegInput icon="📅" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange}
                  style={{ colorScheme:"dark" }} />

                <label className="block text-white/70 text-[13px] font-bold mb-2 mt-1">Gender</label>
                <div className="flex gap-5 mb-4">
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
                <RegInput name="country" placeholder="e.g. Thailand" value={form.country} onChange={handleChange} />

                <label className="block text-white/70 text-[13px] font-bold mb-2">City</label>
                <RegInput name="city" placeholder="e.g. Bangkok" value={form.city} onChange={handleChange} />

                {message && <p className="text-center text-[#ff8fa3] text-[13px] font-bold mt-2">{message}</p>}

                <div className="mt-2"><PrimaryBtn onClick={() => { if (validateStep2()) setStep(3); }}>Next</PrimaryBtn></div>
                <BackBtn onClick={() => setStep(1)} />
              </>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && (
              <>
                <h2 className="text-white text-[28px] font-extrabold tracking-tight mb-5">Language</h2>

                <RegSelect label="Native Language" value={form.nativeLanguage}
                  onChange={e => set("nativeLanguage", e.target.value)}
                  options={LANGUAGES} placeholder="Select your language" />

                <label className="block text-white/70 text-[13px] font-bold mb-2">Learning Language</label>
                {form.learningLanguages.map((ll, i) => (
                  <div key={i} className="flex gap-2 mb-2.5">
                    <div className="flex-[2] relative">
                      <select value={ll.language} onChange={e => updateLearningLanguage(i,"language",e.target.value)}
                        className="w-full bg-white/12 border border-white/10 rounded-2xl py-3.5 pl-4 pr-8 text-white text-sm font-semibold outline-none appearance-none cursor-pointer focus:border-white/35 transition-all"
                        style={{ colorScheme:"dark" }}>
                        <option value="">Select language</option>
                        {LANGUAGES.map(l => <option key={l} value={l} style={{ background:"#1a2d6b" }}>{l}</option>)}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs pointer-events-none">▼</span>
                    </div>
                    <div className="flex-[1.5] relative">
                      <select value={ll.level} onChange={e => updateLearningLanguage(i,"level",e.target.value)}
                        className="w-full bg-white/12 border border-white/10 rounded-2xl py-3.5 pl-4 pr-8 text-white text-sm font-semibold outline-none appearance-none cursor-pointer focus:border-white/35 transition-all"
                        style={{ colorScheme:"dark" }}>
                        <option value="">Level</option>
                        {LEVELS.map(lv => <option key={lv.value} value={lv.value} style={{ background:"#1a2d6b" }}>{lv.label}</option>)}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs pointer-events-none">▼</span>
                    </div>
                  </div>
                ))}

                <button onClick={addLearningLanguage}
                  className="w-full bg-[#4a7fe0] border-0 rounded-xl py-3 text-white text-[13px] font-extrabold cursor-pointer mb-5 hover:bg-[#5a8ff0] transition-colors">
                  + Add More
                </button>

                <h2 className="text-white text-xl font-extrabold mb-1.5">Personal Interest</h2>
                <p className="text-white/40 text-xs font-semibold mb-3">Tap the activities to choose your interests</p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {ALL_INTERESTS.map(item => (
                    <button key={item} type="button" onClick={() => toggleInterest(item)}
                      className={`rounded-full px-3.5 py-1.5 text-[13px] font-bold border cursor-pointer transition-all
                        ${form.interests.includes(item)
                          ? "bg-[#4a7fe0] border-[#4a7fe0] text-white"
                          : "bg-white/10 border-white/15 text-white/65 hover:bg-white/16 hover:border-white/30"
                        }`}>
                      + {item}
                    </button>
                  ))}
                </div>

                <h2 className="text-white text-xl font-extrabold mb-2.5">Bio</h2>
                <textarea placeholder="Tell others about yourself..." value={form.bio}
                  onChange={e => set("bio", e.target.value)}
                  className="w-full bg-white/12 border border-white/10 rounded-2xl py-3.5 px-4 text-white text-sm font-semibold outline-none resize-none min-h-[90px] mb-5 placeholder:text-white/30 focus:border-white/35 focus:bg-white/16 transition-all" />

                {message && (
                  <p className={`text-center text-[13px] font-bold mb-2 ${message.includes("success") ? "text-[#7effa8]" : "text-[#ff8fa3]"}`}>
                    {message}
                  </p>
                )}

                <PrimaryBtn onClick={handleSubmit} disabled={loading}>
                  {loading ? "Signing up..." : "Sign up"}
                </PrimaryBtn>
                <BackBtn onClick={() => setStep(2)} />
              </>
            )}

          </div>
        </div>
    </PhoneFrame>
  );
}

export default Register;