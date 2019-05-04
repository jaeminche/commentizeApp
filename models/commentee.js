const mongoose = require("mongoose");
const Comment = require("./comment");

// SCHEMA SETUP
const commenteeSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ]
});

commenteeSchema.pre("remove", async function(next) {
  try {
    await Comment.remove({
      _id: {
        $in: this.comments
      }
    });
  } catch {
    next(err);
  }
});

module.exports = mongoose.model("Commentee", commenteeSchema);
