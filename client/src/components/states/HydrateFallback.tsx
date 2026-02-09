const brandBlue = "#5085BE";

export const HydrateFallback = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#FAF5EE",
      }}
    >
      <style>{`
        @keyframes logo-pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        .hydrate-pulse {
          animation: logo-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          transform-origin: center center;
        }
        .hydrate-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: ${brandBlue};
          animation: dot-bounce 1.4s ease-in-out infinite;
        }
      `}</style>

      <div className="hydrate-pulse">
        <svg
          display="block"
          width="120"
          height="120"
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            borderRadius: "12%",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <rect width="512" height="512" fill={brandBlue} />
          <text
            x="50%"
            y="54%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            style={{
              fontFamily: "sans-serif",
              fontSize: "300px",
              fontWeight: "400",
              letterSpacing: "-10px",
            }}
          >
            AT
          </text>
        </svg>
      </div>
      <div style={{ display: "flex", gap: "6px", marginTop: "24px" }}>
        <div className="hydrate-dot" style={{ animationDelay: "0s" }} />
        <div className="hydrate-dot" style={{ animationDelay: "0.16s" }} />
        <div className="hydrate-dot" style={{ animationDelay: "0.32s" }} />
      </div>
    </div>
  );
};
