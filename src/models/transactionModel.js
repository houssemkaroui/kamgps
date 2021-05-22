const mongoose = require("mongoose");
const transactionSchema = new mongoose.Schema({
    payment_method:{
        type:String,
        default:"paypal",
        required:true
    },
    transactions: [{
        amount: {
            currency: {
                type:String,
                required:true
            },
            total:{
                 type:String,
                 required:true
            } 
        },
    }],
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date()
       
      },
});

transactionSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'User',
        select: 'name'
    });
    next();
});

const transaction = mongoose.model('transaction', transactionSchema);

module.exports = transaction;


