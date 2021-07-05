
const mongoose = require('mongoose');
const categorieSchema = new mongoose.Schema({
    name: {
        type: String,
        required:[true, 'chaque Categorie a un name']
    },
    description: {
        type: String,
        required:[true, 'chaque Categorie a un description']

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

categorieSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'User',
        select: 'name'
    });
    next();
});

const Categorie = mongoose.model('Categorie', categorieSchema);
module.exports = Categorie;

