
const express = require('express');
const aproximiterController = require('../controllers/aproximiterController')
const authController = require('../controllers/authController')
const fileController = require('../controllers/fileController');

const router = express.Router();
// Protect all routes after this middleware
router.use(authController.protect);
router.use(authController.restrictTo('admin'));
router.post('/AjouterAproximiter',fileController.uploadModelPhotoSingle,fileController.resizeModelPhoto('Aproximiter'),aproximiterController.AjouterAproximiter);
router.get('/ListeAproximiterAdmin',aproximiterController.GetListeAproximiter)
router.delete('/:id',aproximiterController.deleteFavorite);
router.patch('/:id',fileController.uploadModelPhotoSingle,fileController.resizeModelPhoto('Aproximiter'),aproximiterController.updateFavorite);
router
  .route('/AllApproximiter')
  .get(aproximiterController.getAllApproximiter)


module.exports = router;