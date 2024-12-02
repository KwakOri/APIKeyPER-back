const express = require("express");
const router = express.Router();

const { saveTokenData, getAllTokenData } = require("../controllers/token");

router.route("/").get(getAllTokenData).post(saveTokenData);

module.exports = router;
