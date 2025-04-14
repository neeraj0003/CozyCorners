const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Expresserror = require("../utils/Expresserror.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedin } = require("./middleware.js");

const reviewController = require("../controllers/reviews.js");

//pots review route
router.post("/",
  isLoggedin,
  validateReview,
  wrapAsync(reviewController.createReview));



// delete review route 
router.delete("/:reviewId", wrapAsync(reviewController.destroyReview))

module.exports = router;