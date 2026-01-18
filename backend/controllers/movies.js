const Movie = require('../models/Movie');
const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'your-region'
});

const s3 = new AWS.S3();

// Get all movies
exports.getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find({ isActive: true })
            .sort({ releaseDate: -1 });
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get movie by ID
exports.getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.json(movie);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Search movies
exports.searchMovies = async (req, res) => {
    try {
        const query = req.params.query;
        const movies = await Movie.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { genre: { $regex: query, $options: 'i' } },
                { director: { $regex: query, $options: 'i' } }
            ],
            isActive: true
        });
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create movie
exports.createMovie = async (req, res) => {
    try {
        const movieData = req.body;

        // Handle poster upload
        if (req.file) {
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `posters/${Date.now()}-${req.file.originalname}`,
                Body: req.file.buffer,
                ContentType: req.file.mimetype
            };

            const result = await s3.upload(params).promise();
            movieData.poster = result.Location;
        }

        const movie = new Movie(movieData);
        await movie.save();
        res.status(201).json(movie);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update movie
exports.updateMovie = async (req, res) => {
    try {
        const movieData = req.body;

        // Handle poster update
        if (req.file) {
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `posters/${Date.now()}-${req.file.originalname}`,
                Body: req.file.buffer,
                ContentType: req.file.mimetype
            };

            const result = await s3.upload(params).promise();
            movieData.poster = result.Location;
        }

        const movie = await Movie.findByIdAndUpdate(
            req.params.id,
            movieData,
            { new: true, runValidators: true }
        );

        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        res.json(movie);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete movie
exports.deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        res.json({ message: 'Movie deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}; 