const express = require("express");
const router = express.Router();

const verifyJWT = require("../middleware/verifyJWT");

const authRoute = require("./auth");
const tokenRoute = require("./token");
const firebaseRoute = require("./firebase");
const refreshRoute = require("./refresh");
const accountRoute = require("./account");

router.use("/refresh", refreshRoute);
router.use("/auth", authRoute);
router.use("/token", verifyJWT, tokenRoute);
router.use("/firebase", firebaseRoute);
router.use("/account", verifyJWT, accountRoute);

// router.route('/')

module.exports = router;
