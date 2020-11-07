const mongoose = require('mongoose')

let UserSchema = new mongoose.Schema(
  {  
  name: {
  type: String,
  required: true
  },
  email: {
    type: String,
    required: true,
    // unique: true
  },
  password: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
  }, 
  soundbirdId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'}],
  myPlaylist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'song'}]
},
)

let UserModel = mongoose.model('user', UserSchema)

module.exports = UserModel