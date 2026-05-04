// frontend/src/pages/Matches.jsx
// Design Pattern: SINGLETON Pattern
// Reason: Uses the shared `API` axios instance (Singleton) for all requests,
//         ensuring consistent authentication headers across the app.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import BottomNav from "../components/BottomNav";
import PhoneFrame from "../components/PhoneFrame";

const LANG_FLAG = {
  English:"🇬🇧", Thai:"🇹🇭", Japanese:"🇯🇵", Korean:"🇰🇷",
  "Chinese (Mandarin)":"🇨🇳", "Chinese (Cantonese)":"🇨🇳",
  French:"🇫🇷", German:"🇩🇪", Spanish:"🇪🇸", Italian:"🇮🇹",
  Portuguese:"🇵🇹", Arabic:"🇸🇦", Hindi:"🇮🇳", Russian:"🇷🇺",
  Vietnamese:"🇻🇳", Indonesian:"🇮🇩", Malay:"🇲🇾",
  Dutch:"🇳🇱", Swedish:"🇸🇪", Polish:"🇵🇱",
};

function UserCard({ user, onMessage, onProfile }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.07] hover:bg-white/[0.03] transition-colors">
      {/* Avatar */}
      <div onClick={onProfile} className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[#4a7fe0] to-[#2a4a8f]
        flex items-center justify-center text-xl font-extrabold text-white shrink-0 border-2 border-white/15 cursor-pointer overflow-hidden">
        {user.profilePicture
          ? <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
          : (user.name || "U").charAt(0).toUpperCase()
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0" onClick={onProfile}>
        <div className="text-white text-[15px] font-extrabold truncate cursor-pointer hover:underline">{user.name}</div>

        {/* Languages */}
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {user.nativeLanguage && (
            <span className="text-sm">{LANG_FLAG[user.nativeLanguage] || "🌐"}</span>
          )}
          {user.languagesLearning?.length > 0 && (
            <>
              <span className="text-white/35 text-xs">⇌</span>
              {user.languagesLearning.slice(0, 2).map((l, i) => (
                <span key={i} className="text-sm">{LANG_FLAG[l.language] || "🌐"}</span>
              ))}
            </>
          )}
          {user.city && user.country && (
            <span className="text-white/35 text-[11px] font-semibold ml-1">📍 {user.city}, {user.country}</span>
          )}
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-white/45 text-[11px] font-semibold mt-0.5 truncate">{user.bio}</p>
        )}
      </div>

      {/* Message button */}
      <button onClick={onMessage}
        className="shrink-0 bg-[#4a7fe0] border-0 rounded-full px-3.5 py-2 text-white text-xs font-extrabold cursor-pointer hover:bg-[#5a8ff0] transition-colors">
        Message
      </button>
    </div>
  );
}

export default function Matches() {
  const navigate = useNavigate();
  const [tab, setTab]           = useState("matches"); // "matches" | "search"
  const [matches, setMatches]   = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery]     = useState("");
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingSearch, setLoadingSearch]   = useState(false);
  const [noProfile, setNoProfile]           = useState(false);

  useEffect(() => { fetchMatches(); }, []);

  useEffect(() => {
    if (tab !== "search") return;
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timeout = setTimeout(() => handleSearch(searchQuery), 400);
    return () => clearTimeout(timeout);
  }, [searchQuery, tab]);

  const fetchMatches = async () => {
    setLoadingMatches(true);
    try {
      const res = await API.get("/matches");
      setMatches(res.data || []);
    } catch (err) {
      if (err.response?.status === 404) setNoProfile(true);
      setMatches([]);
    } finally { setLoadingMatches(false); }
  };

  // Design Pattern: FACADE Pattern
  // Reason: handleSearch hides the debounce + API call + state update
  //         behind a single function that the UI just calls with a query string.
  const handleSearch = async (q) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setLoadingSearch(true);
    try {
      const res = await API.get(`/matches/search?q=${encodeURIComponent(q)}`);
      setSearchResults(res.data || []);
    } catch { setSearchResults([]); }
    finally { setLoadingSearch(false); }
  };

  const displayList = tab === "matches" ? matches : searchResults;

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0f1c3f] border-b border-white/[0.06]">
          <div className="px-4 pt-5 pb-3">
            <h1 className="text-white text-xl font-black mb-3">Find Partners</h1>

            {/* Search bar — always visible */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 text-sm pointer-events-none">🔍</span>
              <input
                placeholder="Search by name or language..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setTab("search"); }}
                onFocus={() => setTab("search")}
                className="w-full bg-white/10 border border-white/10 rounded-full py-2.5 pl-10 pr-4
                  text-sm font-semibold text-white outline-none placeholder:text-white/30
                  focus:border-white/25 focus:bg-white/13 transition-all"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setSearchResults([]); setTab("matches"); }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-0 text-white/40 text-lg cursor-pointer">×</button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex px-4">
            {[
              { val: "matches", label: "🤝 Suggested" },
              { val: "search",  label: "🔍 Search" },
            ].map(t => (
              <button key={t.val} onClick={() => setTab(t.val)}
                className={`relative flex-1 border-0 bg-transparent pb-3 text-[13px] font-extrabold transition-colors
                  ${tab === t.val ? "text-white" : "text-white/40"}`}>
                {t.label}
                {tab === t.val && <span className="absolute bottom-[-1px] left-[20%] block h-[2.5px] w-[60%] rounded-sm bg-[#4a7fe0]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {tab === "matches" && (
          <>
            {loadingMatches ? (
              <div className="text-center py-16 text-white/30 text-sm">Finding your partners...</div>
            ) : noProfile ? (
              <div className="text-center py-16 px-6 text-white/30">
                <p className="text-4xl mb-3">👤</p>
                <p className="text-sm font-semibold mb-4">Set up your profile first to find language partners</p>
                <button onClick={() => navigate("/profile/edit")}
                  className="bg-[#4a7fe0] border-0 rounded-full px-5 py-2.5 text-white text-sm font-extrabold cursor-pointer">
                  Edit Profile
                </button>
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <p className="text-4xl mb-3">🌍</p>
                <p className="text-sm font-semibold">No matches yet</p>
                <p className="text-xs mt-1">Try updating your language preferences</p>
              </div>
            ) : (
              <div>
                <div className="px-4 py-2.5 text-white/40 text-xs font-bold">
                  {matches.length} partner{matches.length > 1 ? "s" : ""} found
                </div>
                {matches.map(user => (
                  <UserCard key={user._id} user={user}
                    onProfile={() => navigate(`/profile/${user._id}`)}
                    onMessage={() => navigate(`/messages/${user._id}`)} />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "search" && (
          <>
            {!searchQuery.trim() ? (
              <div className="text-center py-16 text-white/30">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-sm font-semibold">Search by name or language</p>
                <p className="text-xs mt-1">e.g. "Thai", "English", "John"</p>
              </div>
            ) : loadingSearch ? (
              <div className="text-center py-16 text-white/30 text-sm">Searching...</div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <p className="text-4xl mb-3">😕</p>
                <p className="text-sm font-semibold">No users found for "{searchQuery}"</p>
              </div>
            ) : (
              <div>
                <div className="px-4 py-2.5 text-white/40 text-xs font-bold">
                  {searchResults.length} result{searchResults.length > 1 ? "s" : ""}
                </div>
                {searchResults.map(user => (
                  <UserCard key={user._id} user={user}
                    onProfile={() => navigate(`/profile/${user._id}`)}
                    onMessage={() => navigate(`/messages/${user._id}`)} />
                ))}
              </div>
            )}
          </>
        )}

      </div>
      <BottomNav />
    </PhoneFrame>
  );
}