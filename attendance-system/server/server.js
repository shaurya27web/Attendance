const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (origin === "http://localhost:5173") return callback(null, true);
    if (origin.endsWith(".vercel.app")) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

app.options("*", cors());
app.use(express.json());

// ─── DB Connect ───────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => { console.error("MongoDB error:", err.message); process.exit(1); });

// ─── Models ───────────────────────────────────────────────────

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

const User = mongoose.model("User", userSchema);

const studentSchema = new mongoose.Schema({
  name:             { type: String, required: true },
  rollNo:           { type: String, required: true, unique: true },
  semester:         { type: Number, required: true },
  course:           { type: String, required: true },
  fingerprintId:    { type: String, default: null },
  totalClasses:     { type: Number, default: 0 },
  attendedClasses:  { type: Number, default: 0 },
}, { timestamps: true });

studentSchema.virtual("attendancePercent").get(function () {
  if (this.totalClasses === 0) return "0.0";
  return ((this.attendedClasses / this.totalClasses) * 100).toFixed(1);
});

studentSchema.set("toJSON",   { virtuals: true });
studentSchema.set("toObject", { virtuals: true });

const Student = mongoose.model("Student", studentSchema);

const logSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  date:    { type: String, required: true },
  tapIn:   { type: Date, default: null },
  tapOut:  { type: Date, default: null },
  status:  { type: String, enum: ["present", "absent", "partial"], default: "partial" },
  source:  { type: String, enum: ["fingerprint", "manual", "rfid"], default: "manual" },
}, { timestamps: true });

logSchema.index({ student: 1, date: 1 }, { unique: true });

const AttendanceLog = mongoose.model("AttendanceLog", logSchema);

// ─── Helpers ──────────────────────────────────────────────────

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  try {
    const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

const today = () => new Date().toISOString().split("T")[0];

// ─── Auth Routes ──────────────────────────────────────────────

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already registered" });
    const user = await User.create({ name, email, password });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });
    res.json({
      _id: user._id, name: user.name, email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get("/api/auth/me", protect, (req, res) => res.json(req.user));

// ─── Student Routes ───────────────────────────────────────────

app.get("/api/students", protect, async (req, res) => {
  try {
    const students = await Student.find().sort({ rollNo: 1 });
    res.json(students);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get("/api/students/:id", protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post("/api/students", protect, async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

app.put("/api/students/:id", protect, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

app.delete("/api/students/:id", protect, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student removed" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Attendance Routes ────────────────────────────────────────

app.get("/api/attendance/live", protect, async (req, res) => {
  try {
    const date = req.query.date || today();
    const logs = await AttendanceLog.find({ date })
      .populate("student", "name rollNo course semester")
      .sort({ updatedAt: -1 });
    res.json(logs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get("/api/attendance/student/:studentId", protect, async (req, res) => {
  try {
    const logs = await AttendanceLog.find({ student: req.params.studentId })
      .populate("student", "name rollNo")
      .sort({ date: -1 });
    res.json(logs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// No auth on tap routes — hardware devices call these directly
app.post("/api/attendance/tap-in", async (req, res) => {
  try {
    const { studentId, fingerprintId, source = "manual" } = req.body;
    const student = fingerprintId
      ? await Student.findOne({ fingerprintId })
      : await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const date = today();
    const existing = await AttendanceLog.findOne({ student: student._id, date });
    if (existing) return res.status(400).json({ message: "Already tapped in today" });

    const log = await AttendanceLog.create({
      student: student._id, date, tapIn: new Date(), status: "partial", source,
    });
    await Student.findByIdAndUpdate(student._id, {
      $inc: { totalClasses: 1, attendedClasses: 1 },
    });
    const populated = await log.populate("student", "name rollNo course semester");
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post("/api/attendance/tap-out", async (req, res) => {
  try {
    const { studentId, fingerprintId, source = "manual" } = req.body;
    const student = fingerprintId
      ? await Student.findOne({ fingerprintId })
      : await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const date = today();
    const log = await AttendanceLog.findOne({ student: student._id, date });
    if (!log) return res.status(404).json({ message: "No tap-in found for today" });
    if (log.tapOut) return res.status(400).json({ message: "Already tapped out" });

    log.tapOut = new Date();
    log.status = "present";
    await log.save();
    const populated = await log.populate("student", "name rollNo course semester");
    res.json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post("/api/attendance/mark", protect, async (req, res) => {
  try {
    const { studentId, date, status } = req.body;
    const targetDate = date || today();
    let log = await AttendanceLog.findOne({ student: studentId, date: targetDate });
    if (log) {
      log.status = status;
      await log.save();
    } else {
      log = await AttendanceLog.create({
        student: studentId, date: targetDate, status, source: "manual",
        tapIn: status !== "absent" ? new Date() : null,
      });
      await Student.findByIdAndUpdate(studentId, {
        $inc: { totalClasses: 1, ...(status !== "absent" && { attendedClasses: 1 }) },
      });
    }
    res.json(log);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Health Check ─────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ─── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));