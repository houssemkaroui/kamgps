
const express = require('express');
const MapsController = require('../controllers/mapsController');
const authController = require('../controllers/authController')

const router = express.Router();
// Protect all routes after this middleware
router.use(authController.protect);
router.post('/listePlaceDirection',MapsController.ListePlaceDirection);
//router.post('/calculeDistance',MapsController.calculeDistance);
router.post('/typeTravelMode',MapsController.TravelMode);
router.post('/listePlace',MapsController.getlistePlace);
//router.post('/listePlaceDirection',MapsController.ListePlaceDirection);
module.exports = router;