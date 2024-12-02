const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

const router = require("./src/routes/index");

app.use(bodyParser.json());
app.use("/", router);

module.exports = app;
