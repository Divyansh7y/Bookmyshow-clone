const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/movies", require("./routes/movies"));
app.use("/api/theaters", require("./routes/theaters"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/partners", require("./routes/partners"));

// Health check (safe to use in tests without DB)
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Database connection & server start helper
const startServer = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn(
        "MONGODB_URI not set — skipping DB connection (useful for tests)",
      );
    } else {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("Connected to MongoDB");
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// If server.js is executed directly, start the server (connect DB + listen)
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
