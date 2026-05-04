// frontend/src/pages/Profile.jsx
// Design Pattern: SINGLETON Pattern
// Reason: API instance is shared across all components (Singleton).
//         MapComponent uses OpenStreetMap via Leaflet — a public API
//         that requires no API key.

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import BottomNav from "../components/BottomNav";
import PhoneFrame from "../components/PhoneFrame";

const LEVEL_DOTS = { A1:1, A2:2, B1:3, B2:4, C1:5, C2:5 };

const LANG_FLAG = {
  English:"🇬🇧", Thai:"🇹🇭", Japanese:"🇯🇵", Korean:"🇰🇷",
  "Chinese (Mandarin)":"🇨🇳","Chinese (Cantonese)":"🇨🇳",
  French:"🇫🇷", German:"🇩🇪", Spanish:"🇪🇸", Italian:"🇮🇹",
  Portuguese:"🇵🇹", Arabic:"🇸🇦", Hindi:"🇮🇳", Russian:"🇷🇺",
  Vietnamese:"🇻🇳", Indonesian:"🇮🇩", Malay:"🇲🇾",
  Dutch:"🇳🇱", Swedish:"🇸🇪", Polish:"🇵🇱",
};

// Design Pattern: FACADE Pattern
// Reason: MapComponent hides the complexity of Leaflet initialization,
//         geocoding via Nominatim API, and map cleanup — behind a simple
//         component that just takes city and country as props.
function MapComponent({ city, country }) {
  const mapRef      = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!city || !country || !mapRef.current) return;
    if (mapInstance.current) return;

    import("leaflet").then(L => {
      // Try city first, fallback to country only
      const tryGeocode = (query) => {
        return fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`)
          .then(r => r.json());
      };

      tryGeocode(`${city}, ${country}`)
        .then(data => {
          if (!data || data.length === 0) return tryGeocode(country);
          return data;
        })
        .then(data => {
          if (!data || data.length === 0 || !mapRef.current) return;

          const { lat, lon } = data[0];

          const map = L.map(mapRef.current, {
            center: [parseFloat(lat), parseFloat(lon)],
            zoom: 11,
            zoomControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            touchZoom: false,
            attributionControl: false, // hide "© OpenStreetMap" text
          });

          // Use a lighter map style
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

          mapInstance.current = map;
        })
        .catch(() => {});
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [city, country]);

  return <div ref={mapRef} style={{ width: "100%", height: "200px" }} />;
}

function LangDots({ level, green = false }) {
  const filled = LEVEL_DOTS[level] || 1;
  return (
    <div className="flex gap-0.5 mt-1">
      {[1,2,3,4,5].map(i => (
        <div key={i} className={`w-[7px] h-[7px] rounded-full ${i <= filled ? (green ? "bg-green-400" : "bg-white") : "bg-white/25"}`} />
      ))}
    </div>
  );
}

function LangItem({ lang, level, green = false }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[28px]">{LANG_FLAG[lang] || "🌐"}</span>
      <span className="text-white/70 text-[11px] font-bold">{lang}</span>
      <LangDots level={level} green={green} />
    </div>
  );
}

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile]               = useState(null);
  const [user, setUser]                     = useState(null);
  const [isFollowing, setIsFollowing]       = useState(false);
  const [followLoading, setFollowLoading]   = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [message, setMessage]               = useState("");
  const [loading, setLoading]               = useState(true);

  const me    = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwn = !id || id === me?.id;

  useEffect(() => { fetchProfile(); }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = isOwn ? await API.get("/profile") : await API.get(`/profile/${id}`);
      setProfile(res.data.profile || res.data);
      setUser(res.data.user || { name: me?.name, email: me?.email });
      setIsFollowing(res.data.isFollowing || false);
      try {
        if (isOwn) {
          const meRes = await API.get("/auth/me");
          setFollowersCount(meRes.data.followers?.length || 0);
          setFollowingCount(meRes.data.following?.length || 0);
        } else {
          const statusRes = await API.get(`/follow/status/${id}`);
          setIsFollowing(statusRes.data.isFollowing || false);
          setFollowersCount(res.data.followersCount || 0);
          setFollowingCount(res.data.followingCount || 0);
        }
      } catch {}
    } catch { setMessage("Could not load profile."); }
    finally { setLoading(false); }
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) { await API.delete(`/follow/${id}`); setIsFollowing(false); setFollowersCount(c => Math.max(0, c-1)); }
      else             { await API.post(`/follow/${id}`);   setIsFollowing(true);  setFollowersCount(c => c+1); }
    } catch (err) { setMessage(err.response?.data?.message || "Action failed"); }
    finally { setFollowLoading(false); }
  };

  if (loading) return (
    <PhoneFrame>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white/50 text-base">Loading...</div>
      </div>
    </PhoneFrame>
  );

  const displayName   = user?.name || "User";
  const handle        = "@" + (user?.email?.split("@")[0] || "user");
  const avatar        = profile?.profilePicture || null;
  const city          = profile?.city || "";
  const country       = profile?.country || "";
  const nativeLang    = profile?.nativeLanguage || "";
  const learningLangs = profile?.languagesLearning || [];
  const interests     = profile?.interests || [];
  const bio           = profile?.bio || "";
  const ageRange      = profile?.ageRange || "";
  const gender        = profile?.gender || "";

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

{/* Map header */}
<div className="relative h-[200px] overflow-hidden bg-[#1a3575]" style={{ zIndex: 0 }}>

  {city && country ? (
    <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
      <MapComponent city={city} country={country} />
    </div>
  ) : (
    <div className="w-full h-full bg-gradient-to-br from-[#1a3575] via-[#2a4a8f] to-[#162860]" />
  )}

  {/* Gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1c3f]/80 via-[#0f1c3f]/20 to-transparent pointer-events-none" style={{ zIndex: 10 }} />

  {/* City & Country */}
  {city && country && (
    <div className="absolute bottom-4 right-4 text-right" style={{ zIndex: 20 }}>
      <div className="text-white text-sm font-extrabold drop-shadow-lg">{city}</div>
      <div className="text-white/70 text-xs font-semibold">{country}</div>
    </div>
  )}

  {/* Back button */}
  <button onClick={() => navigate(-1)}
    className="absolute top-4 left-4 w-9 h-9 rounded-full bg-[rgba(15,28,63,0.8)] border-0 text-white text-lg cursor-pointer flex items-center justify-center backdrop-blur-md"
    style={{ zIndex: 20 }}>
    ←
  </button>

  {/* Edit Profile */}
  {isOwn && (
    <Link to="/profile/edit" style={{ zIndex: 20, position: "absolute", top: 16, right: 16 }}>
      <button className="bg-[rgba(15,28,63,0.8)] border-0 rounded-2xl px-3.5 py-1.5 text-white/80 text-xs font-bold cursor-pointer backdrop-blur-md">
        Edit Profile
      </button>
    </Link>
  )}
</div>

{/* Profile card */}
<div className="bg-gradient-to-b from-[#1a2d6b] to-[#0f1c3f] rounded-t-[28px] -mt-4 relative px-8 pb-24 animate-[fadeUp_0.4s_ease_both] min-h-screen" style={{ zIndex: 30 }}>
  {/* Avatar — sits on top of map */}
  <div className="flex justify-center -mt-20 mb-3 z-[20] relative">
    {avatar ? (
      <img src={avatar} alt="avatar"
        className="w-[110px] h-[110px] rounded-full border-4 border-[#1a2d6b] object-cover" />
    ) : (
      <div className="w-[110px] h-[110px] rounded-full border-4 border-[#1a2d6b] bg-gradient-to-br from-[#4a7fe0] to-[#2a4a8f] flex items-center justify-center text-[44px] text-white font-extrabold shadow-lg">
        {displayName.charAt(0).toUpperCase()}
      </div>
    )}
  </div>
          {/* Stats + Name */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 text-center">
              <div className="text-white text-xl font-black">{followersCount}</div>
              <div className="text-white/50 text-xs font-semibold">Followers</div>
            </div>
            <div className="flex-[2] text-center">
              <div className="text-white text-[22px] font-black tracking-tight">{displayName}</div>
              <div className="text-white/45 text-[13px] font-semibold">{handle}</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-white text-xl font-black">{followingCount}</div>
              <div className="text-white/50 text-xs font-semibold">Following</div>
            </div>
          </div>

          {/* Bio */}
          {bio && <p className="text-center text-white/70 text-[13px] font-semibold leading-snug mt-2.5 mb-4 px-2">{bio}</p>}

          {/* Language flags */}
          <div className="flex items-center justify-center gap-4 mb-5 flex-wrap">
            {nativeLang && <LangItem lang={nativeLang} level="C2" green />}
            {learningLangs.length > 0 && <span className="text-white/40 text-lg mb-3">⇌</span>}
            {learningLangs.map((l, i) => <LangItem key={i} lang={l.language} level={l.level} />)}
          </div>

          {/* Follow / Message */}
          {!isOwn && (
            <div className="flex gap-3 mb-6">
              <button onClick={handleFollow} disabled={followLoading}
                className={`flex-1 border-0 rounded-3xl py-3.5 text-white text-[15px] font-extrabold cursor-pointer transition-all
                  ${isFollowing ? "bg-white/10 border border-white/20" : "bg-[#4a7fe0] shadow-[0_4px_16px_rgba(74,127,224,0.4)] hover:bg-[#5a8ff0]"}
                  disabled:opacity-60 disabled:cursor-not-allowed`}>
                {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
              </button>
              <button onClick={() => navigate(`/messages/${id}`)}
                className="flex-1 bg-white border-0 rounded-3xl py-3.5 text-[#0f1c3f] text-[15px] font-extrabold cursor-pointer hover:bg-[#f0f4ff] transition-all">
                Message
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-white/10 mb-5" />

          {/* About me */}
          <p className="text-white text-[15px] font-black mb-3">Personal Info</p>
          {(gender || ageRange) && (
            <div className="flex items-center gap-3 mb-2.5 text-white/75 text-sm font-semibold">
              <span className="text-lg shrink-0">🔍</span>
              <span>{[gender, ageRange].filter(Boolean).join(", ")}</span>
            </div>
          )}
          {(city || country) && (
            <div className="flex items-center gap-3 mb-2.5 text-white/75 text-sm font-semibold">
              <span className="text-lg shrink-0">📍</span>
              <span>{[city, country].filter(Boolean).join(", ")}</span>
            </div>
          )}

          {interests.length > 0 && (
            <>
              <div className="h-px bg-white/10 my-5" />
              <p className="text-white text-[15px] font-black mb-3">Personal Interest</p>
              <div className="flex flex-wrap gap-2">
                {interests.map(item => (
                  <span key={item} className="bg-white/10 rounded-full px-3.5 py-1.5 text-white/70 text-xs font-bold">{item}</span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Toast */}
        {message && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-[rgba(255,80,80,0.9)] text-white px-5 py-2.5 rounded-full text-[13px] font-bold z-[999] backdrop-blur-md">
            {message}
          </div>
        )}

      </div>
      <BottomNav />
    </PhoneFrame>
  );
}