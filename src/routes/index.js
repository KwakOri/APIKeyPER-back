const express = require("express");
const router = express.Router();

const authRoute = require("./auth");
const tokenRoute = require("./token");
const firebaseRoute = require("./firebase");
const refreshRoute = require("./refresh");

router.use("/refresh", refreshRoute);
router.use("/auth", authRoute);
router.use("/token", tokenRoute);
router.use("/firebase", firebaseRoute);

// router.route('/')

module.exports = router;
