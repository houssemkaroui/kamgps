
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const Email = require('../utils/email');


const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
 
//regester user
exports.signup = catchAsync(async (req, res, next) => {
  if (!req.body) {
    return next(new AppError('Veuillez remplir votre formulaire!', 400));
  }
  if (req.file) req.body.photo = req.file.filename;
  const newUser = await User.create(req.body);
  const token = await signToken(newUser._id);
  newUser.password = undefined;
  res.status(200).json({
    status: 'success',
    token,
    data: {
      newUser
    }
  });

  SendSMS(newUser);
});

 

exports.login = catchAsync(async (req, res, next) => {
  const { phonenumber, password } = req.body;
  // 1) Check if email and password exist
  if (!phonenumber || !password) {
    return next(new AppError('Merci de saisir phonenumber et password correcte!', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ phonenumber }).select('+password');
  if (!user) {
    return next(new AppError("User Not found", 400));
  }
  if (user.active == false) {
    return next(new AppError("Vous n'avez pas les droits d'accés!", 400));
  }

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('wrong Password', 401));
  }

  const token = await signToken(user._id);
  user.password = undefined;
  
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
 // createSendToken(user, 200, res)
});


exports.loginAdmin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Merci de saisir email et password correcte!', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError("téléphone ou bien mot de passe incorrect", 400));
  }
  if (user.active == false) {
    return next(new AppError("Vous n'avez pas les droits d'accés!", 400));
  }

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect téléphone ou mot de passe inco', 401));
  }

  const token = await signToken(user._id);
  user.password = undefined;
  
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
 // createSendToken(user, 200, res)
});

exports.ajouterIDdeviece = catchAsync(async(req,res,next) =>{
  if(!req.user.id) {
    return next (new AppError('verifer votre token',400))
  }
  //user.IDdevice = req.body.IDdevice
  await User.findByIdAndUpdate(req.user.id, {
    IDdevice: req.body.IDdevice
  });
  res.status(200).send({
    message:'ID device ajouter avec succes'
  })
})
//send code with SMS phone
const SendSMS = catchAsync(async (user, req, res, next) => {
  const phonenumber = user.phonenumber;
  if (!phonenumber) {
    return next(new AppError('Numéro de téléphone invalide!', 400));
  }
  const SMS = await client.verify
    .services(process.env.TWILIO_SERVICE_ID)
    .verifications.create({
      locale: 'fr',
      to: `+${phonenumber}`,
      channel: 'sms'
    });
});

//verifer le code envoyer SMS
exports.VeriferCodeSMS = catchAsync(async (req, res, next) => {
  if (!req.body.phonenumber && !req.body.code) {
    return next(new AppError('Code de vérification invalide ou expiré!', 400));
  }

  const verifercode = await client.verify
    .services(process.env.TWILIO_SERVICE_ID)
    .verificationChecks.create({
      to: `+${req.body.phonenumber}`,
      code: req.body.code
    });
    
  const user = await User.findOneAndUpdate(
    { phonenumber: req.body.phonenumber },
    { active: true }
  );

  if (verifercode.status === 'approved') {
    res.status(200).send({
      message: 'votre compte est confirme!'
    });
  } else {
    res.status(400).send({
      message: 'User not Verified!!'
    });
  }
});


exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
//envoyer le code pour verifer 
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const SMSCode = await client.verify
    .services(process.env.TWILIO_SERVICE_ID)
    .verifications.create({
      locale: 'fr',
      to: `+${req.body.phonenumber}`,
      channel: 'sms'
    });
  // 1) Get user based on POSTed email
  const user = await User.findOne({ phonenumber: req.body.phonenumber });
  if (!user) {
    return next(new AppError("Il n'y a aucun utilisateur avec ce numéro de téléphone", 404));
  }
  await user.save({ validateBeforeSave: false });
  // 3) Send it to user's email
  try {
    res.status(200).json({
      status: 'success',
      message: 'code  sent to phonenumber!'

    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("il ya un erreur lors de l'envois de code . Try again later!"),

      500
    );
  }
});
///changer le mot de passe 
exports.resetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ phonenumber: req.body.phonenumber });
  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Le jeton n'est pas valide ou a expiré", 400));

  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200,  res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200,  res);
});

