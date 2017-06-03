//Require mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Create a Schema
var dishSchema = new Schema({
  name: {
      type: String,
      required: true,
      unique: true
  },
  description: {
      type: String,
      required: true
  }
}, {
    timestamps: true
});

//Schema is useless so far
//Need to create a model out of it
var Dishes = mongoose.model('Dish', dishSchema);
module.exports = Dishes; //Turn the model into a node module
