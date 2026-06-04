const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');

router.post('/', ticketController.createTicket); // Public

router.get('/', protect, ticketController.getTickets);
router.get('/export', protect, ticketController.exportTicketsCSV);
router.get('/:id', protect, ticketController.getTicketById);
router.put('/:id', protect, ticketController.updateTicket);
router.delete('/:id', protect, ticketController.deleteTicket);

module.exports = router;
