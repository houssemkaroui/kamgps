const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const categorie = require('../models/categoriesModel');
const factory = require('./handlerFactory');

//ajouter ala liste categorie
exports.AjouterCategorie = catchAsync(async(req,res,next) =>{
    if(!req.body) {
        return next (new AppError('if faut saissire les donnes',400))
    }
   
    if(!req.user.id) {
        return next (new AppError("vérifier votre token",401))
    }
    req.body.userId = req.user.id
  const data = await categorie.create(req.body)
  if(!data) {
      return next (new AppError("l'ajout a la liste des categorie failed",400))
  }
  res.status(201).send({
      data:data
  })

});


//get liste categories by user admin
exports.GetListeCategories = catchAsync(async(req,res,next) =>{
    if (!req.user.id) {
        return next(new AppError("verifer votre token"))
      }
      const listeCategories = await categorie.find({ userId: req.user.id });
      if(!listeCategories){
          return next(new AppError('n existe pas des admin pour cette admine'))
      }
      res.status(200).send({
        count: listeCategories.length,
        data: listeCategories
    
      })
});

//delete categories
exports.deleteCategories = factory.deleteOne(categorie);

//update categories
exports.updateCategories = factory.updateOne(categorie);
