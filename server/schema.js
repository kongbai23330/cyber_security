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
    type: Buffer,
  },
  bio: {
    type: String,
  },
});

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
  content: [{ type: Number }],
  ups: {
    type: Number,
    required: true,
  },
  downs: {
    type: Number,
    required: true,
  },
  lastEditd: {
    type: Number,
    required: true,
  },
});

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
  lastEditd: {
    type: Number,
    required: true,
  },
});

// export { userSchema, postSchema, commentSchema }