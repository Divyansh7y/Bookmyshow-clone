const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const movieController = require("../controllers/movies");
const { auth, checkRole } = require("../middleware/auth");

// Validation middleware
const validateMovie = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("releaseDate").isISO8601().withMessage("Valid release date is required"),
  body("duration")
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive number"),
  body("genre").isArray().withMessage("Genre must be an array"),
  body("language").trim().notEmpty().withMessage("Language is required"),
  body("director").trim().notEmpty().withMessage("Director is required"),
];

// Handler to return validation errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Public routes
router.get("/", movieController.getAllMovies);
// Search must come before :id to avoid treating 'search' as an id
router.get("/search/:query", movieController.searchMovies);
router.get("/:id", movieController.getMovieById);

// Protected routes (Admin only)
router.post(
  "/",
  auth,
  checkRole(["admin"]),
  validateMovie,
  handleValidation,
  movieController.createMovie,
);
router.put(
  "/:id",
  auth,
  checkRole(["admin"]),
  validateMovie,
  handleValidation,
  movieController.updateMovie,
);
router.delete("/:id", auth, checkRole(["admin"]), movieController.deleteMovie);

module.exports = router;
