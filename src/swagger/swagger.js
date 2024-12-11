require("dotenv").config();

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  swaggerDefinition: {
    components: {},
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "APIKeyPER",
      description: "API KEY 저장 관리 서비스",
    },
    servers: [
      {
        url: process.env.SERVER_DOMAIN, // 요청 URL
      },
    ],
  },
  apis: ["./src/swagger/swagger.yaml", "./src/swagger/components.yaml"],
};
const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
