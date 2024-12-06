const express = require("express");
const router = express.Router();

const { signIn, signUp } = require("../controllers/auth");

router.route("/sign-in").post(signIn);

router.route("/sign-up").post(signUp);

module.exports = router;
