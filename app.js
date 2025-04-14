if (process.env.NODE_ENV != "production") {
  require('dotenv').config()
}
console.log(process.env.SECRET)

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const Expresserror = require("./utils/Expresserror.js");
const { reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const listingsRouter = require("./routes/listing.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStartegy = require("passport-local")
const User = require("./models/user.js");

const userRouter = require("./routes/user.js");



const dbUrl = process.env.ATLASDB_URL
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
})



store.on("error", () => {
  console.log("ERROR IN MONGO_SESSION STORE", err);
});


const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  }
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStartegy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
})

// app.get("/demouser", async (req, res) => {
//   let fakeUSer = new User({
//     email: "student@gmail.com",
//     username: "delta-student"
//   });

//   let registeredUser = await User.register(fakeUSer, "helloworld");
//   res.send(registeredUser);
// })


const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let erMsg = error.details.map((el) => el.message).join(" ,");
    throw new Expresserror(400, erMsg);
  } else {
    next();
  }
};

app.use("/listings", listingsRouter);
app.use("/", userRouter);

//pots review toute
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  console.log("New Review Saved");
  res.redirect(`/listings/${listing._id}`)
})
);

// delete review route 
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`);
}
));


app.all("*", (req, res, next) => {
  next(new Expresserror(404, "Page not found !"));
});


app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong !" } = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
