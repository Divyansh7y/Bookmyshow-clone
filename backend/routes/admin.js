const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { auth, checkRole } = require('../middleware/auth');

// Protected routes (Admin only)
router.get('/theaters', auth, checkRole(['admin']), adminController.getAllTheaters);
router.get('/theaters/pending', auth, checkRole(['admin']), adminController.getPendingTheaters);
router.put('/theaters/:id/approve', auth, checkRole(['admin']), adminController.approveTheater);
router.put('/theaters/:id/reject', auth, checkRole(['admin']), adminController.rejectTheater);
router.get('/partners', auth, checkRole(['admin']), adminController.getAllPartners);
router.put('/partners/:id/approve', auth, checkRole(['admin']), adminController.approvePartner);
router.put('/partners/:id/reject', auth, checkRole(['admin']), adminController.rejectPartner);
router.get('/bookings', auth, checkRole(['admin']), adminController.getAllBookings);
router.get('/revenue', auth, checkRole(['admin']), adminController.getRevenue);

module.exports = router; 