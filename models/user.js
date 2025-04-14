const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true // Adding unique constraint
  },
  // Additional fields can be added here, like name, password, etc.
  // name: String,
  // password: String,
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);
