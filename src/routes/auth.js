const express = require("express");
const router = express.Router();

const { logIn, signUp } = require("../controllers/auth");

router.route("/log-in").post(logIn);
router.route("/sign-up").post(signUp);
router.route("/log-out").delete(() => {});
router.route("/accessToken").get(() => {});
router.route("/refreshToken").get(() => {});

module.exports = router;
