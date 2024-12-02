const app = require("../../app");
const logger = require("../config/logger");
const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`PORT: ${port} / Server is listening...`);
});
