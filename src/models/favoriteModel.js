
const mongoose = require('mongoose');
const favoriteSchema = new mongoose.Schema({
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
        default: 'default.jpg',
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
    status: {
        type: String,
        enum: ['private', 'public'],
        default: 'private'
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


favoriteSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'User',
        select: 'name'
    });
    next();
});

const Favorite = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite;

