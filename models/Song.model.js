const mongoose = require('mongoose')

let SongSchema = new mongoose.Schema(
  {  
  spotifyId: {
  type: String,
  required: true
  },
  name: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  // genre: [{
  //   type: String,
  //   required: true
  // }],
  imageUrl: {
    type: String,
    required: true
  }, 
  sample: {
    type: String,
  },
},
)

let SongModel = mongoose.model('song', SongSchema)

module.exports = SongModel