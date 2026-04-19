export default function StudentCard({ student }) {
  var pct = parseFloat(student.attendancePercent || 0);
  var color = pct >= 75 ? "#00e676" : pct >= 50 ? "#ffb300" : "#ff4545";
  var badgeClass = pct >= 75 ? "badge-green" : pct >= 50 ? "badge-yellow" : "badge-red";
  var statusText = pct >= 75 ? "Good" : pct >= 50 ? "At Risk" : "Critical";

  var radius = 18;
  var circumference = 2 * Math.PI * radius;
  var strokeDash = (pct / 100) * circumference;

  return (
    <div
      style={{
        background: "#1a2030",
        border: "1px solid #252d3d",
        borderRadius: "12px",
        padding: "20px",
        transition: "border-color 0.2s, transform 0.2s",
        cursor: "default",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = "#2e3a4e";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = "#252d3d";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "16px",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: "15px",
              color: "#e8edf5",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {student.name}
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "12px",
              color: "#4a5568",
              marginTop: "3px",
            }}
          >
            Roll #{student.rollNo}
          </div>
        </div>

        <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
          <svg width="48" height="48" style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx="24" cy="24" r={radius}
              fill="none" stroke="#161b24" strokeWidth="4"
            />
            <circle
              cx="24" cy="24" r={radius}
              fill="none" stroke={color} strokeWidth="4"
              strokeDasharray={strokeDash + " " + circumference}
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "monospace",
              fontSize: "10px",
              fontWeight: 700,
              color: color,
            }}
          >
            {pct}%
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        {[
          ["Course", student.course],
          ["Semester", "Sem " + student.semester],
          ["Present", student.attendedClasses],
          ["Total", student.totalClasses],
        ].map(function (item) {
          return (
            <div
              key={item[0]}
              style={{
                background: "#161b24",
                borderRadius: "8px",
                padding: "8px 10px",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  color: "#4a5568",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "3px",
                }}
              >
                {item[0]}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#e8edf5",
                  fontFamily: typeof item[1] === "number" ? "monospace" : "inherit",
                }}
              >
                {item[1]}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <span className={"badge " + badgeClass}>{statusText}</span>
      </div>
    </div>
  );
}