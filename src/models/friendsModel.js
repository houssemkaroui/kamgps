
const mongoose = require('mongoose');
const friendSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date()
      },
    IDFriend: {
        type:mongoose.Schema.ObjectId,
        ref: 'User',
        required:true
    }
});

friendSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'User',
        select: 'name'
    });
    next();
});

const Friend = mongoose.model('Friend', friendSchema);

module.exports = Friend;
