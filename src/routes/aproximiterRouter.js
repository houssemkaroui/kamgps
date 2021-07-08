
const express = require('express');
const aproximiterController = require('../controllers/aproximiterController')
const authController = require('../controllers/authController');
const fileController = require('../controllers/fileController');

const router = express.Router();
// Protect all routes after this middleware
router.use(authController.protect);
router.get('/ListeAproximiterAdmin',aproximiterController.GetListeAproximiter)
router.use(authController.restrictTo('admin'));
router.get('/AllApproximiter',aproximiterController.getAllApproximiter);
router.post('/AjouterAproximiter',fileController.uploadModelPhotoSingle,fileController.resizeModelPhoto('Aproximiter'),aproximiterController.AjouterAproximiter);

router.delete('/:id',aproximiterController.deleteFavorite);
router.patch('/:id',fileController.uploadModelPhotoSingle,fileController.resizeModelPhoto('Aproximiter'),aproximiterController.updateApproximiter);
router.get('/:id',aproximiterController.getApproximiterByID);



module.exports = router;


