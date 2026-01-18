const Theater = require('../models/Theater');
const Show = require('../models/Show');
const Booking = require('../models/Booking');

// Create theater
exports.createTheater = async (req, res) => {
    try {
        const theaterData = {
            ...req.body,
            partner: req.user._id
        };

        const theater = new Theater(theaterData);
        await theater.save();

        res.status(201).json(theater);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get partner's theaters
exports.getMyTheaters = async (req, res) => {
    try {
        const theaters = await Theater.find({ partner: req.user._id })
            .sort({ createdAt: -1 });
        res.json(theaters);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update theater
exports.updateTheater = async (req, res) => {
    try {
        const theater = await Theater.findOne({
            _id: req.params.id,
            partner: req.user._id
        });

        if (!theater) {
            return res.status(404).json({ message: 'Theater not found' });
        }

        Object.assign(theater, req.body);
        await theater.save();

        res.json(theater);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create show
exports.createShow = async (req, res) => {
    try {
        const theater = await Theater.findOne({
            _id: req.params.id,
            partner: req.user._id
        });

        if (!theater) {
            return res.status(404).json({ message: 'Theater not found' });
        }

        const showData = {
            ...req.body,
            theater: theater._id
        };

        const show = new Show(showData);
        await show.save();

        res.status(201).json(show);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get theater shows
exports.getTheaterShows = async (req, res) => {
    try {
        const theater = await Theater.findOne({
            _id: req.params.id,
            partner: req.user._id
        });

        if (!theater) {
            return res.status(404).json({ message: 'Theater not found' });
        }

        const shows = await Show.find({ theater: theater._id })
            .populate('movie')
            .sort({ date: 1, startTime: 1 });

        res.json(shows);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update show
exports.updateShow = async (req, res) => {
    try {
        const show = await Show.findById(req.params.id)
            .populate('theater');

        if (!show) {
            return res.status(404).json({ message: 'Show not found' });
        }

        if (show.theater.partner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        Object.assign(show, req.body);
        await show.save();

        res.json(show);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete show
exports.deleteShow = async (req, res) => {
    try {
        const show = await Show.findById(req.params.id)
            .populate('theater');

        if (!show) {
            return res.status(404).json({ message: 'Show not found' });
        }

        if (show.theater.partner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        show.isActive = false;
        await show.save();

        res.json({ message: 'Show deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get partner revenue
exports.getMyRevenue = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const theaters = await Theater.find({ partner: req.user._id });
        const theaterIds = theaters.map(theater => theater._id);

        const query = {
            paymentStatus: 'completed',
            bookingDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        const shows = await Show.find({ theater: { $in: theaterIds } });
        const showIds = shows.map(show => show._id);

        const bookings = await Booking.find({
            ...query,
            show: { $in: showIds }
        });

        const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

        res.json({
            totalBookings: bookings.length,
            totalRevenue
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}; 