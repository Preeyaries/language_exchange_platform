import { useNavigate, useLocation, Link } from "react-router-dom";

const HomeIcon = () => (
  <svg fill="#ffffff" viewBox="0 0 495.398 495.398" style={{width:26,height:26}}>
    <path d="M487.083,225.514l-75.08-75.08V63.704c0-15.682-12.708-28.391-28.413-28.391c-15.669,0-28.377,12.709-28.377,28.391v29.941L299.31,37.74c-27.639-27.624-75.694-27.575-103.27,0.05L8.312,225.514c-11.082,11.104-11.082,29.071,0,40.158c11.087,11.101,29.089,11.101,40.172,0l187.71-187.729c6.115-6.083,16.893-6.083,22.976-0.018l187.742,187.747c5.567,5.551,12.825,8.312,20.081,8.312c7.271,0,14.541-2.764,20.091-8.312C498.17,254.586,498.17,236.619,487.083,225.514z"/>
    <path d="M257.561,131.836c-5.454-5.451-14.285-5.451-19.723,0L72.712,296.913c-2.607,2.606-4.085,6.164-4.085,9.877v120.401c0,28.253,22.908,51.16,51.16,51.16h81.754v-126.61h92.299v126.61h81.755c28.251,0,51.159-22.907,51.159-51.159V306.79c0-3.713-1.465-7.271-4.085-9.877L257.561,131.836z"/>
  </svg>
);

const MessageIcon = () => (
  <svg fill="#ffffff" viewBox="0 0 233.058 233.058" style={{width:26,height:26}}>
    <path d="M116.538,4.05C52.284,4.05,0,45.321,0,96.043c0,28.631,16.729,55.208,45.889,72.911c4.525,2.737,7.635,7.283,8.572,12.478c2.876,16.045-0.991,32.948-6.758,47.576c19.239-9.134,39.064-23.161,54.8-36.63c3.879-3.314,9.055-4.701,14.087-4.354h0.023c64.191,0,116.445-41.259,116.445-91.987C233.058,45.321,180.792,4.05,116.538,4.05z"/>
  </svg>
);

const ProfileIcon = () => (
  <svg fill="#ffffff" viewBox="0 0 60.671 60.671" style={{width:26,height:26}}>
    <ellipse cx="30.336" cy="12.097" rx="11.997" ry="12.097"/>
    <path d="M35.64,30.079H25.031c-7.021,0-12.714,5.739-12.714,12.821v17.771h36.037V42.9C48.354,35.818,42.661,30.079,35.64,30.079z"/>
  </svg>
);

const MatchesIcon = () => (
  <svg fill="#ffffff" viewBox="0 0 24 24" style={{width:26,height:26}}>
    <path fillRule="evenodd" clipRule="evenodd" d="M2 5C2 3.34315 3.34315 2 5 2H19C20.6569 2 22 3.34315 22 5V19C22 20.6569 20.6569 22 19 22H5C3.34315 22 2 20.6569 2 19V5ZM5 4C4.44772 4 4 4.44772 4 5V10H20V5C20 4.44772 19.5523 4 19 4H5ZM4 12V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V12H4ZM14 13C14.2652 13 14.5196 13.1054 14.7071 13.2929L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L14 15.4142L11.7071 17.7071L10.7071 18.7071C10.3166 19.0976 9.68342 19.0976 9.29289 18.7071C8.90237 18.3166 8.90237 17.6834 9.29289 17.2929L9.58579 17L9 16.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L8.29289 14.2929C8.48043 14.1054 8.73478 14 9 14C9.26522 14 9.51957 14.1054 9.70711 14.2929L11 15.5858L13.2929 13.2929C13.4804 13.1054 13.7348 13 14 13ZM11 7C11 6.44772 11.4477 6 12 6H17C17.5523 6 18 6.44772 18 7C18 7.55228 17.5523 8 17 8H12C11.4477 8 11 7.55228 11 7ZM7 8.75C7.9665 8.75 8.75 7.9665 8.75 7C8.75 6.0335 7.9665 5.25 7 5.25C6.0335 5.25 5.25 6.0335 5.25 7C5.25 7.9665 6.0335 8.75 7 8.75Z"/>
  </svg>
);

const NAV_ITEMS = [
  { Icon: HomeIcon,    path: "/feed"      },
  { Icon: MessageIcon, path: "/messages"  },
  { Icon: null,        path: "/posts/new" },
  { Icon: ProfileIcon, path: "/profile"   },
  { Icon: MatchesIcon, path: "/matches"   },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      className="sticky bottom-0 w-full"
      style={{ height: "90px", zIndex: 100, flexShrink: 0 }}
    >
      {/* SVG background */}
      <svg
        viewBox="0 0 390 130"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute bottom-0 left-0 w-full h-[130px]">
        <defs>
          <linearGradient id="navGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="rgb(20,85,160)" />
            <stop offset="50%"  stopColor="rgb(20,50,160)" />
            <stop offset="100%" stopColor="rgba(20,50,160,0.5)" />
          </linearGradient>
        </defs>
        <path
          d="M0,42 L129,42 Q149,42 149,54 A46,46,0,0,0,241,54 Q241,42 261,42 L390,42 L390,130 L0,130 Z"
          fill="url(#navGrad)"
        />
      </svg>

      {/* Plus button */}
      <button
        onClick={() => navigate("/posts/new")}
        className="absolute left-1/2 -translate-x-1/2 z-10 w-[72px] h-[72px]
          rounded-full flex items-center justify-center text-white text-[34px] font-light
          cursor-pointer hover:scale-105 transition-transform border-0"
        style={{
          top: "-20px",
          background: "radial-gradient(circle at 35% 35%, #4a84e8, #1a3fa0)",
          boxShadow: "0 6px 24px rgba(20,50,160,0.5)",
        }}>
        +
      </button>

      {/* Nav items */}
      <div className="absolute bottom-0 left-0 right-0 h-[88px] flex items-center
        justify-around px-4 pb-3 z-[5]">
        {NAV_ITEMS.map(({ Icon, path }) => {
          if (!Icon) return <div key={path} className="w-[72px]" />;

          const active = location.pathname === path ||
            (path === "/profile" && location.pathname.startsWith("/profile"));

          return (
            <Link key={path} to={path}>
              <button className={`bg-transparent border-0 cursor-pointer p-2
                flex items-center justify-center transition-all
                ${active ? "opacity-100 scale-110" : "opacity-50 hover:opacity-100"}`}>
                <Icon />
              </button>
            </Link>
          );
        })}
      </div>

      {/* Home indicator */}
      <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2
        w-[100px] h-[4px] rounded-full bg-white/30 z-[5]" />
    </div>
  );
}