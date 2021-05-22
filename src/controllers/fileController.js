const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const multer = require('multer');
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  // console.log("multer");
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else if (file.mimetype.startsWith('application')) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Pas une image, veuillez télécharger uniquement des images',
        400
      ),
      false
    );
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadModelPhotoSingle = upload.single('photo');
exports.uploadModelImages = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
]);
/* Ajouter fichiers banniere */
exports.uploadModelBanniere = upload.fields([
  { name: 'slider1', maxCount: 3 },
  { name: 'slider2', maxCount: 3 },
  { name: 'slider3', maxCount: 3 },
  { name: 'banniere1', maxCount: 2 },
  { name: 'banniere2', maxCount: 1 },
]);
exports.resizeModelPhoto = (Model) =>
  catchAsync(async (req, res, next) => {
    // console.log('user',req.user);
    if (!req.file) return next();
    req.file.filename = `${Model}-${Date.now()}.png`;
    await sharp(req.file.buffer)
      // .resize(480, 640)
      .toFormat('png')
      .png({ quality: 100 })
      .toFile(`public/img/${Model}/${req.file.filename}`);
    next();
  });

exports.createpdf = (Model) =>
  catchAsync(async (req, res, next) => {
    // console.log("er", req.files.pdf.name.split('.')[0]);
    if (!req.files) {
      return res.status(400).send("Aucun fichier n'a été téléchargé.");
    }
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.pdf;
    let name = `${Model}-${req.files.pdf.name.split('.')[0]}.pdf`;
    // console.log("sampleFile", sampleFile);
    // Use the mv() method to place the file somewhere on your server
    await sampleFile.mv(`public/img/${Model}/${name}`);
    // res.send("File uploaded!");
    // });
    res.status(201).json({
      status: 'Validé',
      // Catalogue: newCatalogue,
      // PointVente: newPointVente,
    });
  });
exports.resizeModelImages = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1)photo image
    if (req.files.photo) {
      req.body.photo = `${Model}-${Date.now()}-photo.jpeg`;
      await sharp(req.files.photo[0].buffer)
        .resize(480, 640)
        .toFormat('jpeg')
        // .jpeg({ quality: 100 })
        .toFile(`public/img/${Model}/${req.body.photo}`);
      // 2)pdf
      // req.body.pdf = `${Model}-${req.user.id}${req.files.pdf.name}.pdf`;
    }
    next();
  });
exports.resizeBanniereImages = (Model) =>
  catchAsync(async (req, res, next) => {
    // console.log("oki", req.files);
    if (!req.files) {
      return next(new AppError("Veuillez ajouter une photo d'abord", 410));
    }
    for (let id = 1; id < 4; id++) {
      // let slider=''
      if (req.files['slider' + id]) {
        // 1)photo image
        await Promise.all(
          req.files['slider' + id].map(async (file, i) => {
            req.body['slider' + id] = `banniere-slider-${id}-${Date.now()}-${
              i + [i]
            }.jpeg`;
            // console.log("req", req.body["slider" + id]);
            //  const filename = `banniere-slider[i]${Date.now()}-${i + [i]}.jpeg`;
            await sharp(file.buffer)
              // .resize(1500, 600)
              .toFormat('jpeg')
              .jpeg({ quality: 100 })
              .toFile(`public/img/${Model}/${req.body['slider' + id]}`);
            // console.log("oki", filename[i]);
          })
        );
      }
    }
    // if (req.files.slider2) {
    //   await Promise.all(
    //     req.files.slider2.map(async (file, i) => {
    //       req.body.slider2 = `banniere-slider2${Date.now()}-${i + 1}.jpeg`;
    //       //  const filename = `banniere-slider2${Date.now()}-${i + 1}.jpeg`;
    //       await sharp(file.buffer)
    //         .resize(1500, 600)
    //         .toFormat("jpeg")
    //         .jpeg({ quality: 100 })
    //         .toFile(`public/img/${Model}/${req.body.slider2}`);
    //       // console.log("oki", filename[i]);
    //     })
    //   );
    // }
    // if (req.files.slider3) {
    //   await Promise.all(
    //     req.files.slider3.map(async (file, i) => {
    //       req.body.slider3 = `banniere-slider3${Date.now()}-${i + 1}.jpeg`;
    //       //  const filename = `banniere-slider3${Date.now()}-${i + 1}.jpeg`;
    //       await sharp(file.buffer)
    //         // .resize(1500, 600)
    //         .toFormat("jpeg")
    //         .jpeg({ quality: 100 })
    //         .toFile(`public/img/${Model}/${req.body.slider3}`);
    //       // console.log("oki", filename[i]);
    //     })
    //   );
    // }
    for (let id = 1; id < 4; id++) {
      if (req.files['banniere' + id]) {
        await Promise.all(
          req.files['banniere' + id].map(async (file, i) => {
            req.body['banniere' + id] = `banniere${id}-${Date.now()}-${
              i + id
            }.jpeg`;
            //  const filename = `banniere1-${Date.now()}-${i + 1}.jpeg`;
            await sharp(file.buffer)
              // .resize(1500, 600)
              .toFormat('jpeg')
              .jpeg({ quality: 100 })
              .toFile(`public/img/${Model}/${req.body['banniere' + id]}`);
            // console.log("oki", filename[i]);
          })
        );
      }
    }
    // if (req.files.banniere2) {
    //   await Promise.all(
    //     req.files.banniere2.map(async (file, i) => {
    //       req.body.banniere2 = `banniere2-${Date.now()}-${i + 1}.jpeg`;
    //       //  const filename = `banniere2-${Date.now()}-${i + 1}.jpeg`;
    //       await sharp(file.buffer)
    //         // .resize(1500, 600)
    //         .toFormat("jpeg")
    //         .jpeg({ quality: 100 })
    //         .toFile(`public/img/${Model}/${req.body.banniere2}`);
    //       // console.log("oki", filename[i]);
    //     })
    //   );
    // }
    next();
  });
exports.resizeBanniereImage = (Model) =>
  catchAsync(async (req, res, next) => {
  
      console.log('file',req.file);
      console.log('body',req.body);
      // console.log('file',req);
      if (!req.file) return next();
      req.file.filename = `${req.body.position}-${Date.now()}.png`;
      req.body.photo=req.file.filename
      await sharp(req.file.buffer)
        // .resize(480, 640)
        .toFormat('png')
        .png({ quality: 100 })
        .toFile(`public/img/${Model}/${req.file.filename}`);
      
    next();
  });
