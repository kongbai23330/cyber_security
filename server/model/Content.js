const { default: mongoose } = require("mongoose");

const contentSchema = new mongoose.Schema({
  contentId: {
    type: Number,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  storage: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Contents", contentSchema);
