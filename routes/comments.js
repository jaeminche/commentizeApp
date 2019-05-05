const express = require("express");
const router = express.Router({ mergeParams: true });
const Commentee = require("../models/commentee");
const Comment = require("../models/comment");

// comments new
router.get("/new", isLoggedIn, function(req, res) {
  Commentee.findById(req.params.id, function(err, foundCommentee) {
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", { commentee: foundCommentee });
    }
  });
});

// comments create
router.post("/", isLoggedIn, function(req, res) {
  Commentee.findById(req.params.id, function(err, foundCommentee) {
    if (err) {
      console.log(err);
      res.redirect("/commentees");
    } else {
      const newCommentText = req.body.comment;
      Comment.create(newCommentText, function(err, comment) {
        if (err) {
          console.log(err);
          res.redirect("/commentees");
        } else {
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          foundCommentee.comments.push(comment);
          foundCommentee.save();
          console.log("comment request data pushed and saved");
          res.redirect(`/commentees/${foundCommentee._id}`);
        }
      });
    }
  });
});

// comments edit
router.get("/:comment_id/edit", checkCommentOwnership, function(req, res) {
  Comment.findById(req.params.comment_id, function(err, foundComment) {
    if (err) {
      res.redirect("back");
    } else {
      res.render("comments/edit", {
        comment: foundComment,
        commentee_id: req.params.id
      });
    }
  });
});

// comments update
router.put("/:comment_id", checkCommentOwnership, function(req, res) {
  Comment.findOneAndUpdate(
    { _id: req.params.comment_id },
    req.body.comment,
    function(err, updatedComment) {
      if (err) {
        res.redirect("back");
      } else {
        res.redirect("/commentees/" + req.params.id);
      }
    }
  );
});

// comments destroy
router.delete("/:comment_id", checkCommentOwnership, function(req, res) {
  Comment.findOneAndDelete({ _id: req.params.comment_id }, function(
    err,
    comment
  ) {
    if (err) {
      console.log(err);
      res.redirect("back");
    } else {
      res.redirect(`/commentees/${req.params.id}`);
    }
  });
});

// middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkCommentOwnership(req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
      if (err) {
        res.redirect("back");
      } else {
        if (foundComment.author.id.equals(req.user._id)) {
          next();
        } else {
          res.redirect("back");
        }
      }
    });
  } else {
    res.redirect("back");
  }
}

module.exports = router;
