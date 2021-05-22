const mongoose = require('mongoose');
const CartepaiementSchema = new mongoose.Schema({
    numeroCarte: {
        type: Number,
        required:true,
        unique:true
    },
    expirationCarte: {
        MM:{
            type:String,
            required:true
        },
        YY:{
            type:String,
            required:true
        }
    },
    CVV:{
        type:String,
        required:true,
        unique:true
    },
    status: {
        type: Boolean,
        default:true
    },
    createdAt: {
        type: Date,
        default: new Date()
       
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
});


CartepaiementSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'User',
        select: 'name'
    });
    next();
});

const Cartepaiement = mongoose.model('Cartepaiement', CartepaiementSchema);

module.exports = Cartepaiement;