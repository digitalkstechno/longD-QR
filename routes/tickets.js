const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');

router.post('/', ticketController.createTicket); // Public

router.get('/', protect, ticketController.getTickets);
router.get('/dashboard/stats', protect, ticketController.getDashboardStats);
router.get('/staff/stats', protect, ticketController.getStaffDashboardStats);
router.get('/export', protect, ticketController.exportTicketsCSV);
router.get('/:id', protect, ticketController.getTicketById);
router.put('/:id', protect, ticketController.updateTicket);
router.post('/:id/notes', protect, ticketController.addNoteToTicket);
router.delete('/:id', protect, ticketController.deleteTicket);

module.exports = router;
