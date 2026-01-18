const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookings');
const { auth } = require('../middleware/auth');

// Protected routes
router.post('/', auth, bookingController.createBooking);
router.get('/user', auth, bookingController.getUserBookings);
router.get('/:id', auth, bookingController.getBookingById);
router.post('/:id/payment', auth, bookingController.processPayment);
router.post('/:id/cancel', auth, bookingController.cancelBooking);

module.exports = router; 