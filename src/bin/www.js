require("dotenv").config();

const app = require("../../app");
const logger = require("../config/logger");

const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`SERVER IS LISTENING, PORT:${PORT}`);
});
