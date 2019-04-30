const express   = require("express");
const router    = express.Router();
const Commentee = require("../models/commentee");

// INDEX: show all commentees
router.get("/", function(req, res) {
    Commentee.find({}, function(err, allCommentees) {
        if(err) {
            console.log('Something went wrong when retrieving data!');
            console.log(err);
        } else {
            res.render('commentees/index', {commentees: allCommentees});    
        }
    });
});

// CREATE: add new commentee to DB
router.post("/", isLoggedIn, function(req, res) {
    const author = {
        id: req.user._id,
        username: req.user.username
    };
    const newCommenteeData = {name: req.body.name, image: req.body.image, description: req.body.description, author: author};
    Commentee.create(newCommenteeData, function(err, commentee) {
        if(err) {
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
    Commentee.findById(req.params.id).populate("comments").exec(function (err, foundCommentee) {
        if(err) {
            console.log(err);
        } else {
            res.render('commentees/show', {commentee: foundCommentee}); 
        }
    });
});

// EDIT COMMENTEE ROUTE
router.get("/:id/edit", function(req, res) {
    Commentee.findById(req.params.id, function(err, foundCommentee) {
        if(err) {
            console.log(err);
            res.redirect("/commentees");
        } else {
            res.render("commentees/edit", {commentee: foundCommentee});              
        }
    });
});

// UPDATE COMMENTEE ROUTE
router.put("/:id", function(req, res) {
    console.log(req.body);
    // req.body.blog.body = req.sanitize(req.body.blog.body);
    Commentee.findOneAndUpdate({_id: req.params.id}, req.body.commentee, function(err, prevCommentee) {
        if (err) {
            res.redirect("/commentees");
        } else {
            res.redirect("/commentees/" + req.params.id);
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
