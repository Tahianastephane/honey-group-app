const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} = require('../controllers/hotelsController');

// Tout le monde authentifié peut lire
router.get('/', auth(), getAllHotels);
router.get('/:id', auth(), getHotelById);

// Seul l'admin peut créer / modifier / supprimer
router.post('/', auth(['admin']), createHotel);
router.put('/:id', auth(['admin']), updateHotel);
router.delete('/:id', auth(['admin']), deleteHotel);

module.exports = router;