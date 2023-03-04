const { default: mongoose } = require("mongoose");

const avatarSchema = new mongoose.Schema({
  avatarId: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  buffer: {
    type: Buffer,
    required: true
  }
});

module.exports = mongoose.model("Avatars", avatarSchema);
