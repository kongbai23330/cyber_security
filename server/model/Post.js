const { default: mongoose } = require("mongoose");

const postSchema = new mongoose.Schema({
  postId: {
    type: Number,
    required: true,
  },
  userId: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  contents: [{ type: Number }],
  comments: [{ type: Number }],
  ups: [{ type: Number }],
  downs: [{ type: Number }],
  lastEdit: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Posts", postSchema);
