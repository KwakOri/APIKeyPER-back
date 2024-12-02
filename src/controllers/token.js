const client = require("../config/db");
const logger = require("../config/logger");

const getAllTokenData = async (req, res) => {
  await client.connect();

  try {
  } catch (err) {
  } finally {
    await client.end();
  }
};

const saveTokenData = async (req, res) => {
  await client.connect();

  const {
    tokenName,
    tokenFrom,
    tokenValue,
    tokenCreatedDate,
    tokenExpiryDate,
    notificationOption,
  } = req.body;
  try {
    const query = `INSERT INTO tokens(token_name, token_from, token_value, token_created_date, token_expiry_date, notification_option) VALUES ($1, $2, $3, $4, $5, $6)`;
    const values = [
      tokenName,
      tokenFrom,
      tokenValue,
      tokenCreatedDate,
      tokenExpiryDate,
      notificationOption,
    ];

    await client.query(query, values);

    logger.info(":201:POST /token 토큰 데이터 저장 성공");
    res.send({ success: true });
  } catch (err) {
    logger.error("토큰 데이터 저장 실패");
    res.send(err);
  } finally {
    await client.end();
  }
};

module.exports = { getAllTokenData, saveTokenData };
