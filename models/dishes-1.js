//require
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Create a comment schema
var commentSchema = new Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

//Create dish schema
var dishSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  comments: [commentSchema]
}, {
  timestamps: true
});


//Schema is useless so far
//Need to create a model out of it
var Dishes = mongoose.model('Dish', dishSchema);
module.exports = Dishes; //Turn the model into a node module
