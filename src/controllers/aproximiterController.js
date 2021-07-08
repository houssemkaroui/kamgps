const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const aproximiter = require('../models/aproximiterModel')
const factory = require('./handlerFactory');
const { getDistance, convertDistance, getSpeed, convertSpeed } = require('geolib');
//ajouter ala liste favorite
exports.AjouterAproximiter = catchAsync(async (req, res, next) => {
  if (!req.body) {
    return next(new AppError('if faut saissire les donnes', 400))
  }
  if (req.file) req.body.photo = req.file.filename;

    if(!req.user.id) {
        return next (new AppError("vérifier votre token",401)).zn
    }
   req.body.userId = req.user.id
  const data = await aproximiter.create(req.body)
  if (!data) {
    return next(new AppError("l'ajout a la liste des aproximiter failed", 400))
  }
  res.status(201).send({
    data: data
  })

})
//get liste favorite by user 
exports.GetListeAproximiter = catchAsync(async(req, res, next) => {
  if (!req.user.id) {
    return next(new AppError("verifer votre token"))
  }
  var { data } = req.body;
  const parametre = "1000"
  console.log(req.body.data)
  var tableux = [];
  const listeAproximiter = await aproximiter.find({ country: req.body.country })
  for (var j = 0; j < listeAproximiter.length; j++) {
    var distance = await getDistance(data, listeAproximiter[j].location, 0.01);
    // console.log(distance)
    var results = await convertDistance(distance, "km");
    if (results < parametre) {
      await tableux.push(listeAproximiter[j])
    }

  }
  res.status(200).send({
    results: tableux.length,
    data: tableux
  })
});


function removeDuplicates(originalArray, prop) {
  var newArray = [];
  var lookupObject = {};
  for (var i in originalArray) {
    lookupObject[originalArray[i][prop]] = originalArray[i];
  }
  for (i in lookupObject) {
    newArray.push(lookupObject[i]);
  }
  return newArray;
}


//update favorite
//exports.updateFavorite = factory.updateOne(favorite);
//delete favorite
exports.deleteFavorite = factory.deleteOne(aproximiter);
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// exports.updateApproximiter = catchAsync(async (req, res, next) => {

//   // 2) Filtered out unwanted fields names that are not allowed to be updated
//   const filteredBody = filterObj(req.params.id,);
//   if (req.file) filteredBody.photo = req.file.filename;

//   // 3) Update user document
//   const updatedFavorite = await aproximiter.findByIdAndUpdate(req.params.id, filteredBody, {
//     new: true,
//     runValidators: true
//   });

//   res.status(200).json({
//     status: 'success',
//     data: {
//       favorite: updatedFavorite
//     }
//   });
// });

exports.getAllApproximiter = catchAsync(async(req,res,next) =>{
  if (!req.user.id) {
    return next(new AppError("verifer votre token"))
  }
  const data = await aproximiter.find({userId: req.user.id});
  res.status(200).send({data:data})
})

// exports.getAllApproximiter = factory.getAll(aproximiter);

exports.getApproximiterByID = factory.getOne(aproximiter);
exports.updateApproximiter = factory.updateOne(aproximiter);