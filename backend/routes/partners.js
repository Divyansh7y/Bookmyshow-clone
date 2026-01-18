const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partners');
const { auth, checkRole } = require('../middleware/auth');

// Protected routes (Partner only)
router.post('/theaters', auth, checkRole(['partner']), partnerController.createTheater);
router.get('/theaters', auth, checkRole(['partner']), partnerController.getMyTheaters);
router.put('/theaters/:id', auth, checkRole(['partner']), partnerController.updateTheater);
router.post('/theaters/:id/shows', auth, checkRole(['partner']), partnerController.createShow);
router.get('/theaters/:id/shows', auth, checkRole(['partner']), partnerController.getTheaterShows);
router.put('/shows/:id', auth, checkRole(['partner']), partnerController.updateShow);
router.delete('/shows/:id', auth, checkRole(['partner']), partnerController.deleteShow);
router.get('/revenue', auth, checkRole(['partner']), partnerController.getMyRevenue);

module.exports = router; 