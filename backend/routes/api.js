const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const travelController = require('../controllers/travelController');
const quoteController = require('../controllers/quoteController');
const verifyToken = require('../middleware/authMiddleware');

// Rutas Públicas
router.post('/login', authController.login);
router.get('/paquetes', travelController.getAllPackages);
router.get('/paquetes/:id', travelController.getPackageById);

// Rutas Privadas / Protegidas por JWT
router.post('/cotizar', verifyToken, quoteController.crearCotizacion);

module.exports = router;