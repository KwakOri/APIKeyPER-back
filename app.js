const express = require("express");
const app = express();

require("dotenv").config();
const router = require("./src/routes");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const nodeCron = require("node-cron");
const { sendScheduledNotification } = require("./src/controllers/firebase");
const logger = require("./src/config/logger");
const cors = require("cors");
// const whitelist = ["http://localhost:3001"];

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       // 만일 whitelist 배열에 origin인자가 있을 경우
//       callback(null, true); // cors 허용
//     } else {
//       logger.error("Not Allowed Origin! => " + origin);
//       callback(new Error("Not Allowed Origin!")); // cors 비허용
//     }
//   },
// };

// app.use(cors(corsOptions)); // 옵션을 추가한 CORS 미들웨어 추가

app.use(
  cors({
    origin: "http://localhost:3001", // 클라이언트 주소
    credentials: true, // 인증 정보(쿠키 등)를 포함하기 위해 필요
  })
);

// app.use(
//   cors({
//     origin: true,
//     credentials: true,
//   })
// );

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// nodeCron.schedule("* * * * *", async () => {
//   await sendScheduledNotification();
//   logger.info("Scheduled notification sent successfully");
// });

app.use("/api", router);

module.exports = app;
