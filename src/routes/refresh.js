const express = require("express");
const router = express.Router();
const { handleRefreshToken } = require("../controllers/refreshToken");

router.route("/").get(handleRefreshToken);

module.exports = router;
