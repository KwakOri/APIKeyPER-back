const express = require("express");
const router = express.Router();

const { logIn, signUp, logOut } = require("../controllers/auth");

router.route("/log-in").post(logIn);
router.route("/sign-up").post(signUp);
router.route("/log-out").delete(logOut);

module.exports = router;
