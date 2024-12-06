const express = require("express");
const router = express.Router();

const {
  saveTokenData,
  getMyTokenDatas,
  getTokenData,
} = require("../controllers/token");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);

router.route("/").get(getMyTokenDatas).post(saveTokenData);
router.route("/:id").get(getTokenData);

module.exports = router;
