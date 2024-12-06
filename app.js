const express = require("express");
const app = express();

require("dotenv").config();
const router = require("./src/routes");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const nodeCron = require("node-cron");

app.use(bodyParser.json());
app.use(cookieParser());

app.cron;

app.use("/api", router);

module.exports = app;
