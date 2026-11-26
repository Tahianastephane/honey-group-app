const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { generateHotelDescription } = require('../controllers/aiController');


router.post('/generate-description', auth(['admin', 'forfaitiste']), generateHotelDescription);

module.exports = router;
