const express = require("express");
const router = express.Router();

const {
  logIn,
  signUp,
  logOut,
  validateEmail,
  verifyEmailVerificationToken,
  handleRefreshToken,
} = require("../controllers/auth");

router.route("/log-in").post(logIn);
router.route("/sign-up").post(signUp);
router.route("/log-out").delete(logOut);
router.route("/sign-up/validation/email").post(validateEmail);
router
  .route("/sign-up/verification/email/:token")
  .get(verifyEmailVerificationToken);
router.route("/refresh").get(handleRefreshToken);
module.exports = router;
