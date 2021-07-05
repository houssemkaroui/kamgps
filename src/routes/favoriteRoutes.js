

const express = require('express');
const favoriteController = require('../controllers/favoriteController')
const authController = require('../controllers/authController')
const fileController = require('../controllers/fileController');

const router = express.Router();
// Protect all routes after this middleware
router.use(authController.protect);
router.post('/AjouterFavorite',fileController.uploadModelPhotoSingle,fileController.resizeModelPhoto('Favorite'),favoriteController.AjouterFavorite);
router.get('/ListeFavoriteUser',favoriteController.GetListeFavorite)
router.delete('/:id',favoriteController.deleteFavorite);
router.patch('/:id',fileController.uploadModelPhotoSingle,fileController.resizeModelPhoto('Favorite'),favoriteController.updateFavorite);


module.exports = router;