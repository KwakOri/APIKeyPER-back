const express = require("express");
const router = express.Router();

const {
  saveTokenData,
  getMyTokenDatas,
  getTokenData,
  updateTokenData,
  deleteTokenData,
} = require("../controllers/token");

router.route("/").get(getMyTokenDatas).post(saveTokenData);
router
  .route("/:id")
  .get(getTokenData)
  .patch(updateTokenData)
  .delete(deleteTokenData);

module.exports = router;
