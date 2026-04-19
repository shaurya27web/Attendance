import { useEffect, useState } from "react";
import api from "../api/axios.js";

function formatTime(d) {
  if (!d) return "--:--";
  return new Date(d).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function getDuration(tapIn, tapOut) {
  if (!tapIn || !tapOut) return null;
  var mins = Math.round((new Date(tapOut) - new Date(tapIn)) / 60000);
  if (mins < 60) return mins + "m";
  return Math.floor(mins / 60) + "h " + (mins % 60) + "m";
}

export default function LiveFeed() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  function fetchLogs() {
    api
      .get("/attendance/live")
      .then(function (res) {
        setLogs(res.data);
        setLoading(false);
      })
      .catch(function (err) {
        console.error(err);
        setLoading(false);
      });
  }

  useEffect(function () {
    fetchLogs();
    var interval = setInterval(fetchLogs, 5000);
    return function () {
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      style={{
        background: "#1a2030",
        border: "1px solid #252d3d",
        borderRadius: "12px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid #252d3d",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#00e676",
            boxShadow: "0 0 6px #00e676",
            animation: "pulse-dot 1.5s ease-in-out infinite",
          }}
        />
        <span style={{ fontWeight: 600, fontSize: "14px", color: "#e8edf5" }}>
          Live Tap Feed
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "monospace",
            fontSize: "10px",
            color: "#4a5568",
          }}
        >
          auto-refresh 5s
        </span>
      </div>

      <div
        style={{
          padding: "8px 18px",
          borderBottom: "1px solid #252d3d",
          background: "#161b24",
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{ fontFamily: "monospace", fontSize: "11px", color: "#8896a8" }}
        >
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
        <span
          style={{ fontFamily: "monospace", fontSize: "11px", color: "#4a5568" }}
        >
          {logs.length} event{logs.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
        {loading ? (
          <div
            style={{
              textAlign: "center",
              color: "#4a5568",
              padding: "40px",
              fontFamily: "monospace",
              fontSize: "12px",
            }}
          >
            Fetching events...
          </div>
        ) : logs.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#4a5568",
              padding: "50px 20px",
            }}
          >
            <div style={{ fontSize: "28px", marginBottom: "10px" }}>
              No activity today
            </div>
            <div style={{ fontSize: "13px" }}>Waiting for fingerprint scan...</div>
          </div>
        ) : (
          logs.map(function (log) {
            var borderColor =
              log.status === "present"
                ? "#00e676"
                : log.status === "partial"
                ? "#ffb300"
                : "#ff4545";
            var badgeCls =
              log.status === "present"
                ? "badge-green"
                : log.status === "partial"
                ? "badge-yellow"
                : "badge-red";
            var dur = getDuration(log.tapIn, log.tapOut);

            return (
              <div
                key={log._id}
                style={{
                  marginBottom: "8px",
                  padding: "12px 14px",
                  background: "#161b24",
                  borderRadius: "8px",
                  borderLeft: "3px solid " + borderColor,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "#e8edf5",
                    }}
                  >
                    {log.student ? log.student.name : "Unknown"}
                  </span>
                  <span className={"badge " + badgeCls}>{log.status}</span>
                </div>

                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "11px",
                    color: "#8896a8",
                    marginBottom: "8px",
                  }}
                >
                  {log.student ? "#" + log.student.rollNo : ""}{" "}
                  {log.student ? log.student.course : ""}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "6px",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(0,230,118,0.05)",
                      border: "1px solid rgba(0,230,118,0.1)",
                      borderRadius: "6px",
                      padding: "6px 8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "9px",
                        color: "#4a5568",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginBottom: "2px",
                      }}
                    >
                      Tap In
                    </div>
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: "11px",
                        color: "#00e676",
                        fontWeight: 700,
                      }}
                    >
                      {formatTime(log.tapIn)}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "rgba(255,69,69,0.05)",
                      border: "1px solid rgba(255,69,69,0.1)",
                      borderRadius: "6px",
                      padding: "6px 8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "9px",
                        color: "#4a5568",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginBottom: "2px",
                      }}
                    >
                      Tap Out
                    </div>
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: "11px",
                        color: log.tapOut ? "#ff4545" : "#4a5568",
                        fontWeight: 700,
                      }}
                    >
                      {formatTime(log.tapOut)}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "8px",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "#8896a8" }}>
                    {dur ? "Duration: " + dur : "Still in session"}
                  </span>
                  <span className="badge badge-blue">{log.source}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}