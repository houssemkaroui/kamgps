
var paypal = require('paypal-rest-sdk');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const cartePayment = require('../models/paymentModel');
const { request } = require('express');
const Transaction = require('../models/transactionModel')
//configuration paypale payement
paypal.configure({
    'mode': 'sandbox',
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_TOKEN
});

//creation de carte payement 
exports.createCartePayement = catchAsync(async (req, res, next) => {
    if (!req.user.id) {
        return next(new AppError('chaque carte a un utilisateur', 401))
    }
    if (!req.body) {
        return next(new AppError('if faut saissire les donnes ', 400))
    }
    req.body.userId = req.user.id
    const carte = cartePayment.create(req.body);
    if (!carte) {
        return next(new AppError('lajout de carte et echouer ', 404))
    }
    res.status(201).send({
        message: "votre carte et ajouter"
    })
})
//liste carte by user 
exports.getCarteUser = catchAsync(async(req,res,next) =>{
    if(!req.user.id) {
        return next (new AppError('chaque carte a un utulisateur',401))
    }
    const carteUser= await cartePayment.find({ userId: req.user.id })
      res.status(200).send({
        data: carteUser
      })
})
//create payment for reduriction to platform paypale 
exports.createPayement = catchAsync(async (req, res, next) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://127.0.0.1:5112/success",
            "cancel_url": "http://127.0.0.1:5112/cancel"
        },
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            },
            // "description": " payment ."
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            res.status(400).send(error)
        } else {
            for(let i = 0;i < payment.links.length;i++){
                if(payment.links[i].rel === 'approval_url'){
                //  res.redirect(payment.links[i].href);
                }
              }
             res.send(payment)
        }
    });

})

//execution le payement par paypale 
exports.execute_payment = catchAsync(async (req, res, next) => {
    const payerId = req.query.PayerID;
    // const payerId = 'XTNH723EYUEB4';
    // const paymentId = 'PAYID-MCDILIA2JE67451T84338450'
    const paymentId = req.query.paymentId;
    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
    };
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });
});
//cancled paiement 
exports.cancledPyaiment = catchAsync(async (req, res, next) => {
    res.send('Cancelled')

})