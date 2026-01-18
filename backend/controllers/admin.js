const Theater = require('../models/Theater');
const User = require('../models/User');
const Booking = require('../models/Booking');
const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Get all theaters
exports.getAllTheaters = async (req, res) => {
    try {
        const theaters = await Theater.find()
            .populate('partner')
            .sort({ createdAt: -1 });
        res.json(theaters);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get pending theaters
exports.getPendingTheaters = async (req, res) => {
    try {
        const theaters = await Theater.find({ isApproved: false })
            .populate('partner')
            .sort({ createdAt: -1 });
        res.json(theaters);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Approve theater
exports.approveTheater = async (req, res) => {
    try {
        const theater = await Theater.findById(req.params.id);
        
        if (!theater) {
            return res.status(404).json({ message: 'Theater not found' });
        }

        theater.isApproved = true;
        await theater.save();

        // Notify partner
        const partner = await User.findById(theater.partner);
        await transporter.sendMail({
            to: partner.email,
            subject: 'Theater Approval',
            html: `
                <h1>Your Theater Has Been Approved!</h1>
                <p>Congratulations! Your theater "${theater.name}" has been approved.</p>
                <p>You can now start adding shows and managing your theater.</p>
            `
        });

        res.json({ message: 'Theater approved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Reject theater
exports.rejectTheater = async (req, res) => {
    try {
        const theater = await Theater.findById(req.params.id);
        
        if (!theater) {
            return res.status(404).json({ message: 'Theater not found' });
        }

        theater.isActive = false;
        await theater.save();

        // Notify partner
        const partner = await User.findById(theater.partner);
        await transporter.sendMail({
            to: partner.email,
            subject: 'Theater Rejection',
            html: `
                <h1>Theater Application Rejected</h1>
                <p>We regret to inform you that your theater "${theater.name}" has been rejected.</p>
                <p>Please contact support for more information.</p>
            `
        });

        res.json({ message: 'Theater rejected successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all partners
exports.getAllPartners = async (req, res) => {
    try {
        const partners = await User.find({ role: 'partner' })
            .sort({ createdAt: -1 });
        res.json(partners);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Approve partner
exports.approvePartner = async (req, res) => {
    try {
        const partner = await User.findById(req.params.id);
        
        if (!partner) {
            return res.status(404).json({ message: 'Partner not found' });
        }

        partner.isVerified = true;
        await partner.save();

        await transporter.sendMail({
            to: partner.email,
            subject: 'Partner Account Approved',
            html: `
                <h1>Partner Account Approved!</h1>
                <p>Congratulations! Your partner account has been approved.</p>
                <p>You can now start adding theaters and managing your business.</p>
            `
        });

        res.json({ message: 'Partner approved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Reject partner
exports.rejectPartner = async (req, res) => {
    try {
        const partner = await User.findById(req.params.id);
        
        if (!partner) {
            return res.status(404).json({ message: 'Partner not found' });
        }

        partner.isActive = false;
        await partner.save();

        await transporter.sendMail({
            to: partner.email,
            subject: 'Partner Account Rejected',
            html: `
                <h1>Partner Account Rejected</h1>
                <p>We regret to inform you that your partner account has been rejected.</p>
                <p>Please contact support for more information.</p>
            `
        });

        res.json({ message: 'Partner rejected successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user')
            .populate('show')
            .sort({ bookingDate: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get revenue
exports.getRevenue = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const query = {
            paymentStatus: 'completed',
            bookingDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        const bookings = await Booking.find(query);
        const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

        res.json({
            totalBookings: bookings.length,
            totalRevenue
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}; 