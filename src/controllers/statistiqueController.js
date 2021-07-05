const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const favorite = require('../models/favoriteModel')
const categorie = require('../models/categoriesModel')
const approximiter = require('../models/aproximiterModel')
const factory = require('./handlerFactory');

//Nombre de lieux ajouter
exports.NombresLieux = catchAsync(async(req,res,next) =>{
    if(!req.user.id) {
        return next (new AppError("vérifier votre token",401))
    }
   const Nombres_Lieux = await approximiter.find({ userId: req.user.id });
   res.status(200).send({data:Nombres_Lieux.length})
});

//Nombre de favorie ajouter
exports.NombresFavories = catchAsync(async(req,res,next) =>{
    if(!req.user.id) {
        return next (new AppError("vérifier votre token",401))
    }
   const Nombres_Favories  = await approximiter.find({ userId: req.user.id });
   res.status(200).send({data:Nombres_Favories.length})
});

