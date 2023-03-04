const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: Number,
  },
  bio: {
    type: String,
  },
});

module.exports = mongoose.model("Users", userSchema);
