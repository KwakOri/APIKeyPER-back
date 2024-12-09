const express = require("express");
const router = express.Router();
const { handleRefreshToken } = require("../controllers/refresh");

router.route("/").get(handleRefreshToken);

module.exports = router;
