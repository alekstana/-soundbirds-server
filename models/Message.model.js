const mongoose = require('mongoose')

let MessageSchema = new mongoose.Schema(
  {
  body: [String],
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'},
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'}
  }
)


let MessageModel = mongoose.model('message', MessageSchema)

module.exports = MessageModel;