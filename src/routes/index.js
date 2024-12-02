const express = require("express");
const router = express.Router();

const tokenRoutes = require("./token");

router.use("/token", tokenRoutes);

// router.route('/')

module.exports = router;
