const express = require("express");
const router = express.Router();

const {
  saveTokenData,
  getMyTokenDatas,
  getTokenData,
  updateTokenData,
  deleteTokenData,
} = require("../controllers/token");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);

router.route("/").get(getMyTokenDatas).post(saveTokenData);
router
  .route("/:id")
  .get(getTokenData)
  .patch(updateTokenData)
  .delete(deleteTokenData);

module.exports = router;
