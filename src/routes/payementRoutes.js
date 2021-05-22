

const express = require('express');
const payementController = require('../controllers/payementController')
const authController = require('../controllers/authController')

const router = express.Router();
// Protect all routes after this middleware
router.use(authController.protect);

router.post('/createPayement',payementController.createPayement);
router.post('/AjouterCartepayement',payementController.createCartePayement)
router.post('/success',payementController.execute_payment);
router.get('/cancel',payementController.cancledPyaiment);

module.exports = router;