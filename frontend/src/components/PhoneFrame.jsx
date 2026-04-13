// src/components/PhoneFrame.jsx
export default function PhoneFrame({ children, light = false }) {
  return (
    <div
      style={{
        fontFamily: "'Nunito', sans-serif",
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#ffffff",
      }}
    >
      <style>{`
        .phone-frame-inner::-webkit-scrollbar { display: none; }
        .phone-frame-inner { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div
        className="phone-frame-inner"
        style={{
          width: "100%",
          maxWidth: "390px",
          height: "100dvh",
          maxHeight: "100dvh",
          background: light
            ? "#e8eef8"
            : "linear-gradient(135deg, #1a3575 0%, #1a2d6b 60%, #162860 100%)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          borderRadius: "clamp(0px, calc((100vw - 410px) / 2), 44px)",
          boxShadow: "0 0 0 1.5px rgba(255,255,255,0.08), 0 40px 120px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {children}
      </div>
    </div>
  );
}