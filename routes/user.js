


const express = require("express");
const router = express.Router();
const user = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("./middleware.js");
const usercontroller = require("../controllers/users.js");



router.
  route("/signup")
  .get(usercontroller.rendersignupForm)
  .post(wrapAsync(usercontroller.signup));


router.route("/login")
  .get(usercontroller.renderloginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: '/login',
      failureFlash: true
    }),
    usercontroller.login);


router.get("/logout", usercontroller.logout);

module.exports = router;