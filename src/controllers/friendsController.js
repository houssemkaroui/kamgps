const catchAsync = require("../utils/catchAsync");
const factory = require('./handlerFactory');
const Friend = require("../models/friendsModel");
const AppError = require("../utils/appError");
const axios = require('axios');
const User = require('../models/userModel')
const notification = require('../models/notificationModel');
const socket = require('../../server');
const APIFeatures = require("../utils/apiFeatures");

// 1 recherche un amis dans dans la base 
exports.rechercheAmis = catchAsync(async (req, res, next) => {
  // socket.ioObject.sockets.emit("userdata", "How are You ?");
  const { phonenumber } = req.body
  if (!phonenumber) {
    return next(new AppError('il faut saisire un numero de téléphone', 400))
  }
  const user = await User.findOne({ phonenumber });
  if (!user) {
    return next(new AppError("il n'y a aucun utilisateur avec cette numero", 400))
  }
  const notif = await notification.find({$or:[{$and:[{ idSender: user._id }, { idReciverd: req.user.id },{ status: "encours" }]},{$and:[{ idSender: req.user.id }, { idReciverd: user._id },{ status: "encours" }]}]})
  if(notif.length != 0) {
    return next(new AppError("vous avez déja envoyé une invitation",400))
  }
  const data = await Friend.find({$or:[{$and:[{ IDFriend: user._id }, { userId: req.user.id }]},{$and:[{ IDFriend: req.user.id }, { userId: user._id }]}]})
   if (data.length != 0) {
    res.status(200).send({
      message: 'tu es déjà ami avec lui'
    })
  }
  else {
    res.status(200).send({
      data: user
    })
  }


});
// 2 demande amis 
exports.demandeAmis = catchAsync(async (req, res, next) => {
  const { phonenumber } = req.body
  if (!phonenumber) {
    return next(new AppError('Merci de saisir un numéro de téléphone  correcte!', 400));
  }
  const recived = await User.findOne({ phonenumber });
  if (!recived) {
    return next(new AppError("il n'existe aucun utilisateur avec cette numéro de téléphone", 400));
  }
  if (req.user.id != recived._id) {
    req.body.idSender = req.user.id;
    req.body.idReciverd = recived._id
    req.body.include_player_ids = [recived.IDdevice]
    var options = {
      method: 'POST',
      url: 'https://onesignal.com/api/v1/notifications',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${process.env.NOTIFICATION_TOKEN}`
      },
      data: req.body
    };
    const sendNotification = await axios.request(options);
    const saveNotification = await notification.create(req.body);
    if (!sendNotification) {
      return next(new AppError("il ya un erreur lors de l'envoie de notification", 400));
    }
    var body = new notification({
      contents:req.body.contents,
      headings:req.body.headings,
      status:req.body.status,
      setLocationByfriend:req.body.setLocationByfriend,
      type:req.body.type,
      location:req.body.location,
      idSender:req.user.id,
      idReciverd : recived._id,
      createdAt:new Date()
    })
    socket.ioObject.sockets.emit("data", body);
    res.status(200).send({
      message: 'notification send',
      idNotification: saveNotification._id
    });
  }
  else {
    res.status(400).send({
      message: 'vous pouvez pas envoyer un demande a vous meme'
    })
  }

});
// 3 update notification accept pour friend 
exports.demendeAccepterFriends = catchAsync(async (req, res) => {
  if (!req.user.id) {
    return next(new AppError('verifer votre token ', 401))
  }
  
  const notif = await notification.findOneAndUpdate({_id:req.body.id},{ status: req.body.status });
    req.body.userId = req.user.id
    var friend1 = new Friend({
      userId:req.user.id,
      IDFriend:req.body.IDFriend
    })
    var friend2 = new Friend({
      userId:req.body.IDFriend,
      IDFriend:req.user.id
    })
    const data1 = await Friend.create(friend1)
    const data2 = await Friend.create(friend2)
    if (!data) {
      return next(new AppError("il ya un err lors de l'ajout ala liste d'amis "))
    }
    res.status(201).send({
     // data: data,
      message: `Votre demande ${req.body.status}`,
    })

});

//recherche dans ma liste de friend 
exports.recherchFreinds = catchAsync(async(req,res,next) =>{
  const { phonenumber } = req.body

  if(!req.user.id) {
    return next (new AppError("verifer votre token ",401))
  }
  const user = await User.findOne({phonenumber})
  if(!user) {
    return next(new AppError('il n ya pas de friends avec cette phone number',400))
  }

  const data = await Friend.find({$or:[{$and:[{ userId: req.user.id }, { IDFriend: user._id }]},{$and:[{ userId: user._id }, { IDFriend: req.user.id }]}]})
   if(data.length !=0){
     res.status(200).send({
       data:user
     })
   }else{
     res.status(200).send({
       message:"vous n'êtes pas des amis"
     })
   }


})
// 1 send notification to friend for accepte or refuse location
exports.SendNotification = catchAsync(async (req, res, next) => {
  const { phonenumber } = req.body
  //app_id =157c4da9-c189-439a-b76c-f4bf32edaba2
  if (!phonenumber) {
    return next(new AppError('Merci de saisir un numéro de téléphone  correcte!', 400));
  }
  const recived = await User.findOne({ phonenumber });
  
  if (!recived) {
    return next(new AppError("il n'existe aucun utilisateur avec cette numéro de téléphone", 400));
  }
  req.body.idSender = req.user.id;
  req.body.idReciverd = recived._id
  req.body.setLocationByfriend = 'location'
  req.body.include_player_ids = [recived.IDdevice]
  var options = {
    method: 'POST',
    url: 'https://onesignal.com/api/v1/notifications',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${process.env.NOTIFICATION_TOKEN}`
    },
    data: req.body
  };
  const sendNotification = await axios.request(options);
  const saveNotification = await notification.create(req.body);
  if (!sendNotification) {
    return next(new AppError("il ya un erreur lors de l'envoie de notification", 400));
  }
  socket.ioObject.sockets.emit("data", req.body);
  res.status(200).send({
    message: 'notification send',
    idNotification: saveNotification._id
  });
});
//testmongodb .send()
// 2 update notification accept pour location
exports.demendeAccepterLocation = catchAsync(async (req, res) => {
  if (!req.user.id) {
    return next(new AppError('verifer votre token ', 401))
  }

  if (req.body.status === 'accepter') {
    await notification.findByIdAndUpdate(req.body.id, {
      status: req.body.status, location: req.body.location
    });


  } else if (req.body.status === 'refuser') {
    await notification.findByIdAndUpdate(req.body.id, {
      status: req.body.status
    });
  }

  res.status(200).json({
    message: `Votre demande ${req.body.status}`,

  });
});

// 3 get location from notification to the sender notification
exports.getLocation = catchAsync(async (req, res, next) => {
  if (!req.user.id) {
    return next(new AppError('verifer votre token', 401));
  }

  await notification.create(req.body)
  const data = await notification.findById(req.params.id)

  if (!data) {
    return next(new AppError("il n'existe pas cette id ", 400))
  }
  res.status(200).send(data.location)
});

//consulter liste notification by user 
exports.getUserNotification = catchAsync(async (req, res, next) => {
  if (!req.user.id) {
    return next(new AppError('verifer votre token', 401))
  }
  const doc = await notification.find({ $or: [{ idReciverd: req.user.id }, { idSender: req.user.id }] })
  .populate([{
    path: 'idReciverd ',
    select: 'name phonenumber',
  },{
      path: 'idSender',
      select: 'name phonenumber'
    
  }]);
  if (!doc) {
    return next(new AppError('No notification found with that ID', 404));
  }


  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
      NombresNotifications: doc.length
    },

  });
});

//recevoire notification de votre demende 
exports.repenseDemende = catchAsync(async (req, res, next) => {
  if (!req.user.id) {
    return next(new AppError('verifer votre token ', 401))
  }
  const { phonenumber } = req.body
  //app_id =157c4da9-c189-439a-b76c-f4bf32edaba2
  if (!phonenumber) {
    return next(new AppError('Merci de saisir un numéro de téléphone  correcte!', 400));
  }
  const recived = await User.findOne({ phonenumber });
  req.body.idSender = req.user.id;
  req.body.idReciverd = recived._id
  req.body.include_player_ids = [recived.IDdevice]
  var options = {
    method: 'POST',
    url: 'https://onesignal.com/api/v1/notifications',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${process.env.NOTIFICATION_TOKEN}`
    },
    data: req.body
  };
  req.body.type = 'recived';
  req.body.setLocationByfriend = req.body.setLocationByfriend;
  
  const sendNotification = await axios.request(options);
  if (!sendNotification) {
    return next(new AppError("il ya un erreur lors de l'envoie de notification", 400));
  }
  res.status(200).send({
    message: 'notification send',
  });

});

//get liste friends 
exports.getListeFriends = catchAsync(async (req, res, next) => {
  if (!req.user.id) {
    return next(new AppError("verifer votre token"))
  }
  const listeFriends = await Friend.find({ userId: req.user.id }).populate({
    path: 'IDFriend ',
    select: 'name role lat lng address photo '
  })
  res.status(200).send({
    count: listeFriends.length,
    data: listeFriends
  })
});
//recherche des friends
exports.serchePlace = catchAsync(async (req, res, next) => {
  var options = {
    method: 'GET',
    url: process.env.URL_GOOGLE_FRIENDS_SEARCH + req.body.input + '&inputtype=textquery&fields=photos,name,geometry,formatted_address,opening_hours&key='
      + process.env.KEY_GOOGLE_FRIENDS_SERCHE
  }

  var data = await axios.request(options)
  if (!data) {
    return next(new AppError('verifer votre key', 401))
  }
  res.status(200).send(data.data)
});
exports.updateFriend = factory.updateOne(Friend);
exports.deleteFriend = factory.deleteOne(Friend);
exports.deleteNotification = factory.deleteOne(notification);

exports.deleteTowFriend = catchAsync(async(req,res,next) =>{
  var data = await Friend.deleteMany({$or:[{$and:[{ userId: req.user.id }, { IDFriend: req.body.IDFriend }]},{$and:[{ userId: req.body.IDFriend }, { IDFriend:req.user.id }]}]});
  if(!data) {
     return next(new AppError("erreur lors de suppression de friend"))
  }
  res.status(200).send({
    message:'Friends delete'
  })
})
// socket.ioObject.sockets.in("_room" + req.body.id).emit("msg", "How are You ?");


