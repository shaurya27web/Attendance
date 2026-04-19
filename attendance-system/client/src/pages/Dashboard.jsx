import { useEffect, useState } from "react";
import api from "../api/axios.js";
import Navbar from "../components/Navbar.jsx";
import StudentCard from "../components/StudentCard.jsx";
import LiveFeed from "../components/LiveFeed.jsx";

var COURSES = ["B.Tech CSE", "B.Tech ECE", "B.Tech ME", "BCA", "MCA", "B.Sc IT"];

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("All");
  const [activeTab, setActiveTab] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", rollNo: "", semester: "", course: "" });
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState("");

  function fetchStudents() {
    api
      .get("/students")
      .then(function (res) {
        setStudents(res.data);
        setLoading(false);
      })
      .catch(function (err) {
        console.error(err);
        setLoading(false);
      });
  }

  useEffect(function () {
    fetchStudents();
  }, []);

  function handleAdd() {
    if (!form.name || !form.rollNo || !form.semester || !form.course) {
      setFormError("All fields are required.");
      return;
    }
    setAdding(true);
    setFormError("");
    api
      .post("/students", {
        name: form.name,
        rollNo: form.rollNo,
        semester: Number(form.semester),
        course: form.course,
      })
      .then(function () {
        setShowModal(false);
        setForm({ name: "", rollNo: "", semester: "", course: "" });
        fetchStudents();
      })
      .catch(function (err) {
        setFormError(
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : "Failed to add student."
        );
      })
      .finally(function () {
        setAdding(false);
      });
  }

  var courses = ["All"].concat(
    students
      .map(function (s) { return s.course; })
      .filter(function (c, i, arr) { return arr.indexOf(c) === i; })
  );

  var filtered = students.filter(function (s) {
    var matchSearch =
      s.name.toLowerCase().indexOf(search.toLowerCase()) !== -1 ||
      s.rollNo.toLowerCase().indexOf(search.toLowerCase()) !== -1 ||
      s.course.toLowerCase().indexOf(search.toLowerCase()) !== -1;
    var matchCourse = filterCourse === "All" || s.course === filterCourse;
    var matchTab = activeTab === "all" || parseFloat(s.attendancePercent) < 75;
    return matchSearch && matchCourse && matchTab;
  });

  var total = students.length;
  var above75 = students.filter(function (s) { return parseFloat(s.attendancePercent) >= 75; }).length;
  var below75 = students.filter(function (s) { return parseFloat(s.attendancePercent) < 75 && s.totalClasses > 0; }).length;
  var avg = total
    ? (students.reduce(function (acc, s) { return acc + parseFloat(s.attendancePercent || 0); }, 0) / total).toFixed(1)
    : "0.0";

  var inputStyle = {
    background: "#161b24",
    border: "1px solid #2e3a4e",
    borderRadius: "8px",
    padding: "9px 14px",
    color: "#e8edf5",
    fontSize: "14px",
    outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0c10" }}>
      <Navbar />

      <div style={{ padding: "24px 28px", maxWidth: "1440px", margin: "0 auto" }}>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          {[
            { label: "Total Students", value: total,        color: "#00d4ff" },
            { label: "Avg Attendance",  value: avg + "%",   color: "#e8edf5" },
            { label: "Above 75%",       value: above75,     color: "#00e676" },
            { label: "Below 75%",       value: below75,     color: "#ff4545" },
          ].map(function (item) {
            return (
              <div
                key={item.label}
                style={{
                  background: "#1a2030",
                  border: "1px solid #252d3d",
                  borderRadius: "12px",
                  padding: "18px 20px",
                }}
              >
                <div
                  style={{
                    color: "#4a5568",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "8px",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "28px",
                    fontWeight: 700,
                    color: item.color,
                    lineHeight: 1,
                  }}
                >
                  {item.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* Left */}
          <div>
            {/* Toolbar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "14px",
                flexWrap: "wrap",
              }}
            >
              <input
                value={search}
                onChange={function (e) { setSearch(e.target.value); }}
                placeholder="Search name, roll no, course..."
                style={{ ...inputStyle, flex: 1, minWidth: "200px" }}
                onFocus={function (e) { e.target.style.borderColor = "#00d4ff"; }}
                onBlur={function (e) { e.target.style.borderColor = "#2e3a4e"; }}
              />
              <select
                value={filterCourse}
                onChange={function (e) { setFilterCourse(e.target.value); }}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {courses.map(function (c) {
                  return <option key={c} value={c}>{c}</option>;
                })}
              </select>
              <button
                onClick={function () { setShowModal(true); setFormError(""); }}
                style={{
                  padding: "9px 20px",
                  background: "#00d4ff",
                  color: "#000",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                }}
              >
                + Add Student
              </button>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: "4px",
                marginBottom: "16px",
                background: "#1a2030",
                padding: "4px",
                borderRadius: "8px",
                width: "fit-content",
                border: "1px solid #252d3d",
              }}
            >
              {[["all", "All Students"], ["low", "Below 75%"]].map(function (tab) {
                return (
                  <button
                    key={tab[0]}
                    onClick={function () { setActiveTab(tab[0]); }}
                    style={{
                      padding: "6px 16px",
                      borderRadius: "6px",
                      border: "none",
                      background: activeTab === tab[0] ? "#161b24" : "transparent",
                      color: activeTab === tab[0] ? "#e8edf5" : "#4a5568",
                      fontSize: "13px",
                      fontWeight: activeTab === tab[0] ? 600 : 400,
                    }}
                  >
                    {tab[1]}
                    {tab[0] === "low" && below75 > 0 && (
                      <span
                        style={{
                          marginLeft: "6px",
                          background: "#ff4545",
                          color: "#fff",
                          borderRadius: "10px",
                          padding: "1px 6px",
                          fontSize: "10px",
                          fontFamily: "monospace",
                        }}
                      >
                        {below75}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Grid */}
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "80px",
                  color: "#4a5568",
                  fontFamily: "monospace",
                }}
              >
                Loading students...
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: "14px",
                }}
              >
                {filtered.map(function (s) {
                  return <StudentCard key={s._id} student={s} />;
                })}
                {filtered.length === 0 && (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      textAlign: "center",
                      padding: "60px",
                      color: "#4a5568",
                    }}
                  >
                    No students found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right - Live Feed */}
          <div
            style={{
              position: "sticky",
              top: "76px",
              height: "calc(100vh - 110px)",
            }}
          >
            <LiveFeed />
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          onClick={function (e) {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#1a2030",
              border: "1px solid #2e3a4e",
              borderRadius: "12px",
              padding: "32px",
              width: "100%",
              maxWidth: "440px",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#e8edf5",
                marginBottom: "24px",
              }}
            >
              Add New Student
            </h3>

            {formError && (
              <div
                style={{
                  background: "rgba(255,69,69,0.1)",
                  border: "1px solid rgba(255,69,69,0.3)",
                  color: "#ff4545",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "13px",
                }}
              >
                {formError}
              </div>
            )}

            {[
              { field: "name",     label: "Full Name",   type: "text",   placeholder: "e.g. Rahul Sharma" },
              { field: "rollNo",   label: "Roll Number", type: "text",   placeholder: "e.g. CS2024001"    },
              { field: "semester", label: "Semester",    type: "number", placeholder: "1 to 8"            },
            ].map(function (item) {
              return (
                <div key={item.field} style={{ marginBottom: "14px" }}>
                  <label
                    style={{
                      display: "block",
                      color: "#8896a8",
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "6px",
                    }}
                  >
                    {item.label}
                  </label>
                  <input
                    type={item.type}
                    placeholder={item.placeholder}
                    value={form[item.field]}
                    onChange={function (e) {
                      var val = e.target.value;
                      setForm(function (p) {
                        var next = Object.assign({}, p);
                        next[item.field] = val;
                        return next;
                      });
                    }}
                    style={{
                      width: "100%",
                      background: "#161b24",
                      border: "1px solid #2e3a4e",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      color: "#e8edf5",
                      fontSize: "14px",
                      outline: "none",
                    }}
                    onFocus={function (e) { e.target.style.borderColor = "#00d4ff"; }}
                    onBlur={function (e) { e.target.style.borderColor = "#2e3a4e"; }}
                  />
                </div>
              );
            })}

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  color: "#8896a8",
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "6px",
                }}
              >
                Course
              </label>
              <select
                value={form.course}
                onChange={function (e) {
                  var val = e.target.value;
                  setForm(function (p) {
                    return Object.assign({}, p, { course: val });
                  });
                }}
                style={{
                  width: "100%",
                  background: "#161b24",
                  border: "1px solid #2e3a4e",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  color: form.course ? "#e8edf5" : "#4a5568",
                  fontSize: "14px",
                  outline: "none",
                }}
              >
                <option value="">Select course...</option>
                {COURSES.map(function (c) {
                  return <option key={c} value={c}>{c}</option>;
                })}
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={function () { setShowModal(false); }}
                style={{
                  flex: 1,
                  padding: "11px",
                  background: "transparent",
                  border: "1px solid #2e3a4e",
                  color: "#8896a8",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={adding}
                style={{
                  flex: 2,
                  padding: "11px",
                  background: adding ? "#2e3a4e" : "#00d4ff",
                  color: adding ? "#4a5568" : "#000",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: adding ? "not-allowed" : "pointer",
                }}
              >
                {adding ? "Adding..." : "Add Student"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}