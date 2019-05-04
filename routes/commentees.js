const express = require("express");
const router = express.Router();
const Commentee = require("../models/commentee");
const Comment = require("../models/comment");

// INDEX: show all commentees
router.get("/", function(req, res) {
  Commentee.find({}, function(err, allCommentees) {
    if (err) {
      console.log("Something went wrong when retrieving data!");
      console.log(err);
    } else {
      res.render("commentees/index", { commentees: allCommentees });
    }
  });
});

// CREATE: add new commentee to DB
router.post("/", isLoggedIn, function(req, res) {
  const author = {
    id: req.user._id,
    username: req.user.username
  };
  const newCommenteeData = {
    name: req.body.name,
    image: req.body.image,
    description: req.body.description,
    author: author
  };
  Commentee.create(newCommenteeData, function(err, commentee) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/commentees");
    }
  });
});

// NEW: show form to create new commentee
router.get("/new", isLoggedIn, function(req, res) {
  res.render("commentees/new");
});

// SHOW: show more info about one commentee
router.get("/:id", function(req, res) {
  Commentee.findById(req.params.id)
    .populate("comments")
    .exec(function(err, foundCommentee) {
      if (err) {
        console.log(err);
      } else {
        res.render("commentees/show", { commentee: foundCommentee });
      }
    });
});

// EDIT COMMENTEE ROUTE
router.get("/:id/edit", checkCommenteeOwnership, function(req, res) {
  Commentee.findById(req.params.id, function(err, foundCommentee) {
    res.render("commentees/edit", { commentee: foundCommentee });
  });
});

// UPDATE COMMENTEE ROUTE
router.put("/:id", checkCommenteeOwnership, function(req, res) {
  console.log(req.body);
  // req.body.blog.body = req.sanitize(req.body.blog.body);
  Commentee.findOneAndUpdate(
    { _id: req.params.id },
    req.body.commentee,
    function(err, prevCommentee) {
      if (err) {
        res.redirect("/commentees");
      } else {
        res.redirect("/commentees/" + req.params.id);
      }
    }
  );
});

// DESTROY COMMENTEE ROUTE
router.delete("/:id", checkCommenteeOwnership, function(req, res, next) {
  Commentee.findById(req.params.id, function(err, commentee) {
    if (err) return next(err);
    commentee.remove();
    // req.flash("success", "Commentee deleted successfully!");
    res.redirect("/commentees");
  });
});

// middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkCommenteeOwnership(req, res, next) {
  if (req.isAuthenticated()) {
    Commentee.findById(req.params.id, function(err, foundCommentee) {
      if (err) {
        res.redirect("back");
      } else {
        if (foundCommentee.author.id.equals(req.user._id)) {
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
