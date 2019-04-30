const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  methodOverride = require("method-override"),
  Commentee = require("./models/commentee"),
  Comment = require("./models/comment"),
  User = require("./models/user"),
  seedDB = require("./seeds");

// requiring routes
const commentRoutes = require("./routes/comments"),
  commenteeRoutes = require("./routes/commentees"),
  indexRoutes = require("./routes/index");

mongoose.connect("mongodb://localhost:27017/commentize", {
  useNewUrlParser: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log("connection to Mongoose successful!");
});

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
// seedDB();

// PASSPORT CONFIG
app.use(
  require("express-session")({
    secret: "We miss ggomangi",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// this middleware gets called in every route
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

app.use("/", indexRoutes);
app.use("/commentees", commenteeRoutes);
app.use("/commentees/:id/comments", commentRoutes);

// app.listen(process.env.PORT, process.env.IP, function() {
//   console.log("app is listening");
// });

app.listen(3000);
