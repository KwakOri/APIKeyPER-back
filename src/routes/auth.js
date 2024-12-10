const express = require("express");
const router = express.Router();

const { logIn, signUp, logOut, verifyEmail } = require("../controllers/auth");

router.route("/log-in").post(logIn);
router.route("/sign-up").post(signUp);
router.route("/log-out").delete(logOut);
router.route("/sign-up/validation/email").post(verifyEmail);

// TODO:
// auth/sign-up/validation/email
// auth/sign-up/validation/code

module.exports = router;
