require("dotenv").config();
const express = require("express");
const app = express();
const router = require("./src/routes");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const nodeCron = require("node-cron");
const { sendScheduledNotification } = require("./src/controllers/firebase");
const logger = require("./src/config/logger");
const cors = require("cors");
const { swaggerUi, specs } = require("./src/swagger/swagger");

app.use(
  cors({
    origin: "*",
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Origin",
    ],
    exposedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Origin",
    ],
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// nodeCron.schedule("0 9 * * *", async () => {
//   await sendScheduledNotification();
//   logger.info("Scheduled notification sent successfully");
// });

app.get("/", (req, res) => {
  res.send(JSON.stringify({ success: true, message: "server is working" }));
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use("/api", router);

/**
 * 파라미터 변수 뜻
 * req : request 요청
 * res : response 응답
 */

/**
 * @path {GET} http://localhost:3000/
 * @description 요청 데이터 값이 없고 반환 값이 있는 GET Method
 */
app.get("/", (req, res) => {
  //Hello World 데이터 반환
  res.send("Hello World");
});

module.exports = app;
