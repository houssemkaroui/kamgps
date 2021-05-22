const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
 contents: {
     en:{
        type: String,
        require:true
     }
    
  },
  headings: {
      en:{
    type: String,
    require:true
  }
  },
  include_player_ids:{
      type:Array,
      require:true
  },
  filters:[],
  status: {
    type:String,
    enum:['encours','accepter','refuser'],
    default:'encours'
  },
  createdAt: {
    type: Date,
    default: new Date()
  },
    idSender: {
    type: mongoose.Schema.ObjectId,
     ref: 'User',
     required: [true, 'notification must belong to a user']
  },
  idReciverd :{
    type:mongoose.Schema.ObjectId,
    required: [true, 'notification must belong to a user'],
    ref:'User'
  },
  setLocationByfriend: {
    type: String,
     enum:['friends','location'],
     default: 'friends'
  },
  type:{
     type:String,
     enum:['sender','recived'],
     default:'sender'
  },
  location:{
       lat:{
         type:String,
         required:true,
         default:10.00
       },
       lng:{
         type:String,
         required:true,
         default:10.00
       }
  }

});

notificationSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'User',
    select: 'name'
  });
  next();
});
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;