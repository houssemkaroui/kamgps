
const mongoose = require('mongoose');
const aproximiterSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    addresse: {
        type: String,
        required: true

    },
    categorie: {
        type: String
    },
    photo: {
        type: String,
        required: true

    },
    
    location: {

        lat: {
            type: String,
            required: true
        },
        lng: {
            type: String,
            required: true
        }

    },
    country :{
        type:String,
        required:true
    },
    status: {
        type: String,
        enum: ['private', 'public'],
        default: 'public'
    },
    createdAt: {
        type: Date,
        default: new Date()

    },

    // userId: {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'User',
    //     required: true
    // },
   
});

aproximiterSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'User',
        select: 'name'
    });
    next();
});

const Aproximiter = mongoose.model('Aproximiter', aproximiterSchema);
module.exports = Aproximiter;

