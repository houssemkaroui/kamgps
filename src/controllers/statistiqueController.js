const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const favorite = require('../models/favoriteModel')
const categorie = require('../models/categoriesModel')
const approximiter = require('../models/aproximiterModel')
const friend = require('../models/friendsModel')
const user = require ('../models/userModel')
const factory = require('./handlerFactory');

//Nombre de lieux ajouter
exports.NombresLieux = catchAsync(async(req,res,next) =>{
    if(!req.user.id) {
        return next (new AppError("vérifier votre token",401))
    }
   const Nombres_Lieux = await approximiter.find({ });
   res.status(200).send({data:Nombres_Lieux.length})
});

//Nombre de favorie ajouter
exports.NombresFavories = catchAsync(async(req,res,next) =>{
    if(!req.user.id) {
        return next (new AppError("vérifier votre token",401))
    }
   const Nombres_Favories  = await favorite.find({  });
   res.status(200).send({data:Nombres_Favories.length})
});


exports.NombreAmisTotale = catchAsync(async(req,res,next) =>{
    if(!req.user.id) {
        return next (new AppError("vérifier votre token",401))
    }
   const Nombres_Favories  = await friend.find({});
   res.status(200).send({data:Nombres_Favories.length/2})
});


exports.NombreUtulistauerActive = catchAsync(async(req,res,next) =>{
    if(!req.user.id) {
        return next (new AppError("vérifier votre token",401))
    }
   const Nombres_Visiteur  = await user.find({active :true});
   res.status(200).send({data:Nombres_Visiteur.length})
});
