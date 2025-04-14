const Listing = require("../models/listing");
const Expresserror = require("../utils/Expresserror.js");
const { listingSchema, reviewSchema, isReviewAuthor } = require("../schema.js");
const review = require("../models/review.js");


module.exports.isLoggedin = (req, res, next) => {
  console.log(req.path, "..", req.originalUrl);
  console.log(req.user);
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged in to Create Listing");
    return res.redirect("/login");
  }
  next();
};



module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};


module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the Owner of this Listing");
    return res.redirect(`/listings/${id}`);
  }

  next();
};


module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);

  if (error) {
    let erMsg = error.details.map((el) => el.message).join(" ,");
    throw new Expresserror(400, erMsg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let erMsg = error.details.map((el) => el.message).join(" ,");
    throw new Expresserror(400, erMsg);
  } else {
    next();
  }
};


module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await review.findById(reviewId);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the Owner of this Review");
    return res.redirect(`/listings/${id}`);
  }

  next();
};
