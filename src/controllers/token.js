const client = require("../config/db");
const logger = require("../config/logger");

const getMyTokenDatas = async (req, res) => {
  const { user_id } = req;
  console.log(user_id);

  try {
    const query = `SELECT * FROM tokens WHERE user_id = $1`;
    const values = [user_id];
    const { rows } = await client.query(query, values);
    console.log(rows);

    if (rows.length === 0) {
      return res.send(JSON.stringify({ data: null }));
    } else {
      return res.send(JSON.stringify({ data: rows }));
    }
  } catch (err) {
    logger.error("토큰 데이터 조회 실패", err);
    res.send(err);
  }
};

const saveTokenData = async (req, res) => {
  const {
    tokenName,
    tokenFrom,
    tokenValue,
    tokenCreatedDate,
    tokenExpiryDate,
    notificationOption,
  } = req.body;
  try {
    const query = `INSERT INTO tokens(token_name, token_from, token_value, token_created_date, token_expiry_date, notification_option, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
    const values = [
      tokenName,
      tokenFrom,
      tokenValue,
      tokenCreatedDate,
      tokenExpiryDate,
      notificationOption,
      user_id,
    ];

    await client.query(query, values);

    logger.info(":201:POST /token 토큰 데이터 저장 성공");
    return res.send({ success: true });
  } catch (err) {
    logger.error("토큰 데이터 저장 실패", err);
    return res.send(err);
  }
};

const getTokenData = async (req, res) => {
  const tokenDataId = req.params.id;

  try {
    const query = `SELECT * FROM tokens WHERE id = $1`;
    const values = [tokenDataId];
    const { rows } = await client.query(query, values);
    console.log(rows);

    if (rows.length === 0) {
      return res.send(JSON.stringify({ data: null }));
    } else {
      return res.send(JSON.stringify({ data: rows[0] }));
    }
  } catch (err) {
    logger.error("토큰 데이터 조회 실패", err);
    res.send(err);
  }
};

module.exports = { getMyTokenDatas, saveTokenData, getTokenData };
