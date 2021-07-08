

const express = require('express');
const statestiqueController = require('../controllers/statistiqueController')
const authController = require('../controllers/authController')

const router = express.Router();
// Protect all routes after this middleware
router.use(authController.protect);
router.use(authController.restrictTo('admin'));
router.get('/NombresLieux',statestiqueController.NombresLieux);
router.get('/NombresFavories',statestiqueController.NombresFavories);
router.get('/NombresAmisTotale',statestiqueController.NombreAmisTotale);
router.get('/NombresVisiteur',statestiqueController.NombreUtulistauerActive);



module.exports = router;