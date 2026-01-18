const express = require("express");
const router = express.Router();
const Theater = require("../models/Theater");

// Get all active theaters (public)
router.get("/", async (req, res) => {
  try {
    const theaters = await Theater.find({
      isActive: true,
      isApproved: true,
    }).sort({ createdAt: -1 });
    res.json(theaters);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get theater by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id);
    if (!theater || !theater.isActive) {
      return res.status(404).json({ message: "Theater not found" });
    }
    res.json(theater);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
