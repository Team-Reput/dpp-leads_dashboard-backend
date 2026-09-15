// // This is the entry point of your backend — the file you actually run.
// // It starts the server and wires up every route file.

// require("dotenv").config(); // loads values from .env into process.env
// const express = require("express");
// const cors = require("cors");

// const authRoutes = require("./routes/auth.routes");
// const dashboardRoutes = require("./routes/dashboard.routes");

// const app = express();

// // Allow your Angular app (different port) to call this API
// app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:4200" }));

// // Lets Express read JSON sent in request bodies (req.body)
// app.use(express.json());

// // Any request to /api/auth/... goes to auth.routes.js
// app.use("/api/auth", authRoutes);

// // Any request to /api/dashboard/... goes to dashboard.routes.js
// app.use("/api/dashboard", dashboardRoutes);

// // Simple health check — visit http://localhost:4000/health to confirm the server is alive
// app.get("/health", (req, res) => {
//   res.json({ success: true, status_code: 200, message: "Dashboard backend running", data: null });
// });

// const port = process.env.PORT || 4000;
// app.listen(port, () => {
//   console.log(`Dashboard backend listening on http://localhost:${port}`);
// });

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
require("./config/db");
const app = express();

// Support multiple allowed origins via comma-separated env var,
// so you can add your deployed Angular URL without touching code later
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:4200")
  .split(",")
  .map((url) => url.trim());

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman/curl/health checks)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/health", (req, res) => {
  res.json({ success: true, status_code: 200, message: "Dashboard backend running", data: null });
});

// Catch-all for unmatched routes — without this, hitting a wrong URL in
// production returns a raw stack trace instead of clean JSON
app.use((req, res) => {
  res.status(404).json({ success: false, status_code: 404, message: "Route not found", data: null });
});

// Global error handler — catches anything that slips through
// try/catch in your controllers, so the server never crashes silently
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, status_code: 500, message: "Unexpected server error", data: null });
});

// IMPORTANT: no hardcoded port fallback assumption — most hosts assign
// their own PORT via env var and ignore whatever you hardcode
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Dashboard backend listening on port ${port}`);
});