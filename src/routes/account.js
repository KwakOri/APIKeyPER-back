const express = require("express");
const router = express.Router();
const { deleteAccount } = require("../controllers/account");

router.route("/").delete(deleteAccount);

module.exports = router;
