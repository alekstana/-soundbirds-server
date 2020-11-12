const mongoose = require('mongoose')

let MessageSchema = new mongoose.Schema(
  {
  body: [String],
  roomId: String,
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'},
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'},
  },
  {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
  }
)  


let MessageModel = mongoose.model('message', MessageSchema)

module.exports = MessageModel;