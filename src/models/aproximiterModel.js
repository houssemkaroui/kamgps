
const mongoose = require('mongoose');
const aproximiterSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    addresse: {
        type: String,
        required: [true, 'chaque lieux a un addresse']

    },
    categorie: {
        type: String,
        required: [true, 'chaque lieux a un categorie']

    },
    photo: {
        type: String,
        required: [true, 'chaque lieux a un photo']

    },
    
    location: {
        lat: {
            type: String,
            required: [true, 'chaque lieux a un lat']
        },
        lng: {
            type: String,
            required: [true, 'chaque lieux a un lng']
        }

    },
    country :{
        type:String,
        // required: [true, 'chaque lieux a un country']
    },
    CountryCode:{
     type:String,
    //  required: [true, 'chaque lieux a un CountryCode']
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
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
   
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

