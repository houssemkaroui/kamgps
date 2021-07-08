const express = require('express');
const categorieController = require('../controllers/categorieController')
const authController = require('../controllers/authController')


const router = express.Router();
// Protect all routes after this middleware
router.use(authController.protect);
router.use(authController.restrictTo('admin'));
router.post('/AjouterCategorie',categorieController.AjouterCategorie);
 router.get('/ListeCategoriesUser',categorieController.GetListeCategories);
 router.delete('/:id',categorieController.deleteCategories);
 router.patch('/:id',categorieController.updateCategories);
 router.get('/:id',categorieController.getCategorie);
module.exports = router;