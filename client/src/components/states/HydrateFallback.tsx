const brandBlue = "#4479A2";

export const HydrateFallback = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f9f9f9",
      }}
    >
      <style>{`
        @keyframes logo-pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pulse {
          animation: logo-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          transform-origin: center center;
        }
      `}</style>

      <div className="animate-pulse">
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
          {/* Background Square */}
          <rect width="512" height="512" fill={brandBlue} />

          {/* "AT" Text - Using system fonts to ensure it renders without MUI/Google Fonts */}
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
    </div>
  );
};
