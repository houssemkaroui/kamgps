const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const favorite = require('../models/favoriteModel')
const factory = require('./handlerFactory');

//ajouter ala liste favorite
exports.AjouterFavorite = catchAsync(async(req,res,next) =>{
    if(!req.body) {
        return next (new AppError('if faut saissire les donnes',400))
    }
    if (req.file) req.body.photo = req.file.filename;

    if(!req.user.id) {
        return next (new AppError("vérifier votre token",401))
    }
    req.body.userId = req.user.id
  const data = await favorite.create(req.body)
  if(!data) {
      return next (new AppError("l'ajout a la liste des favorite failed",400))
  }
  res.status(201).send({
      data:data
  })

})
//get liste favorite by user 
exports.GetListeFavorite = catchAsync(async(req,res,next) =>{
    if (!req.user.id) {
        return next(new AppError("verifer votre token"))
      }
      const listeFavorites = await favorite.find({ userId: req.user.id })
      res.status(200).send({
        count: listeFavorites.length,
        data: listeFavorites
    
      })
});

//update favorite
exports.updateFavorite = factory.updateOne(favorite);
//delete favorite
exports.deleteFavorite = factory.deleteOne(favorite);
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  };
  
// exports.updateFavorite = catchAsync(async (req, res, next) => {
  
//     // 2) Filtered out unwanted fields names that are not allowed to be updated
//     const filteredBody = filterObj(req.params.id,);
//     if (req.file) filteredBody.photo = req.file.filename;
     
//     // 3) Update user document
//     const updatedFavorite = await favorite.findByIdAndUpdate(req.params.id, filteredBody, {
//       new: true,
//       runValidators: true
//     });
  
//     res.status(200).json({
//       status: 'success',
//       data: {
//         favorite: updatedFavorite
//       }
//     });
//   });