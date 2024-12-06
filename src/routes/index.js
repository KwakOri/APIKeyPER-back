const express = require("express");
const router = express.Router();

const tokenRoute = require("./token");
const firebaseRoute = require("./firebase");

router.use("/token", tokenRoute);
router.use("/firebase", firebaseRoute);

// router.route('/')

module.exports = router;
