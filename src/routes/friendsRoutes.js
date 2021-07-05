
const express = require('express');
const authController = require('../controllers/authController')
const friendsController = require('../controllers/friendsController')

const router = express.Router();
// Protect all routes after this middleware

router.post('/sendSMS',friendsController.sendSmS)
router.use(authController.protect);
//fonction de friends
router.post('/rechercheAmis',friendsController.rechercheAmis);
router.post('/demendeFriends',friendsController.demandeAmis)
router.patch('/demendeAccepterFriend',friendsController.demendeAccepterFriends);
//router.post('/ajouterFriend',friendsController.ajouterFriends);

//fonction de location
router.post('/recherchfriend',friendsController.recherchFreinds)
router.post('/sendNotification',friendsController.SendNotification);
router.patch('/demendeAccepterLocation',friendsController.demendeAccepterLocation)
router.get('/getLocation/:id',friendsController.getLocation);
//fonction pour les deux location ou friend 
router.post('/recoitNotification',friendsController.repenseDemende);
//lite friend
router.get('/listeFrends',friendsController.getListeFriends);
//listeNotification
router.get('/listeNotificationByUser',friendsController.getUserNotification);
router.delete('/delete',friendsController.deleteTowFriend);

router.patch('/:id',friendsController.updateFriend);
router.delete('/:id',friendsController.deleteFriend);
router.delete('/notification/:id',friendsController.deleteNotification)
router.post('/serchePlace',friendsController.serchePlace);


/// send smms for downlod app kamgps in the playstor
// router.post('/sendSMS',friendsController.sendSmS)


module.exports = router;