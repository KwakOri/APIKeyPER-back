const express = require("express");
const app = express();

require("dotenv").config();
const router = require("./src/routes");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const nodeCron = require("node-cron");
const { sendScheduledNotification } = require("./src/controllers/firebase");
const logger = require("./src/config/logger");

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// nodeCron.schedule("* * * * *", async () => {
//   await sendScheduledNotification();
//   logger.info("Scheduled notification sent successfully");
// });

app.use("/api", router);

module.exports = app;
