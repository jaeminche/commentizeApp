const express    = require("express");
const router     = express.Router({mergeParams: true});
const Commentee = require("../models/commentee");
const Comment    = require("../models/comment");

// comments new
router.get("/new", isLoggedIn, function(req, res) {
    Commentee.findById(req.params.id, function(err, foundCommentee) {
        if(err) {
            console.log(err);
        } else {
            res.render("comments/new", {commentee: foundCommentee});
        }
    });
});

// comments create
router.post("/", isLoggedIn, function(req, res) {
    Commentee.findById(req.params.id, function(err, foundCommentee) {
        if(err) {
            console.log(err);
            res.redirect("/commentees");
        } else {
            const newCommentData = req.body.comment;
            Comment.create(newCommentData, function(err, comment) {
                if(err) {
                    console.log(err);
                    res.redirect("/commentees");
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    foundCommentee.comments.push(comment);
                    foundCommentee.save();
                    console.log("comment request data pushed and saved!");
                    res.redirect(`/commentees/${foundCommentee._id}`);
                }
            });
        }
    });
});

// middleware
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = router;