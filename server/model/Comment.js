const { default: mongoose } = require("mongoose");

const commentSchema = new mongoose.Schema({
  commentId: {
    type: Number,
    required: true,
  },
  userId: {
    type: Number,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  lastEdit: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Comments", commentSchema);
