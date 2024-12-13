const client = require("../config/db");
const logger = require("../config/logger");
const Token = require("../models/Token");

const getAllTokenData = async (req, res) => {
  const { user_id } = req;
  try {
    const query = `SELECT * FROM tokens WHERE user_id = $1`;
    const values = [user_id];
    const { rows } = await client.query(query, values);

    if (rows.length === 0) {
      return res.send(JSON.stringify({ data: null }));
    } else {
      return res.send(JSON.stringify({ data: Token.makeRowsToTokens(rows) }));
    }
  } catch (err) {
    logger.error("토큰 데이터 조회 실패", err);
    res.send(err);
  }
};

const saveTokenData = async (req, res) => {
  const {
    tokenName,
    tokenDescription,
    tokenValue,
    tokenCreatedDate,
    tokenExpiryDate,
    notificationOption,
  } = req.body;
  const { user_id } = req;
  try {
    const query = `INSERT INTO tokens(token_name, token_description, token_value, token_created_date, token_expiry_date, notification_option, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
    const values = [
      tokenName,
      tokenDescription,
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

    if (rows.length === 0) {
      logger.info(":200:GET /token/:id 토큰 조회 성공, 데이터 없음");
      return res.send(JSON.stringify({ data: null }));
    } else {
      logger.info(":200:GET /token/:id 토큰 조회 성공");
      return res.send(
        JSON.stringify({
          data: Token.makeRowsToToken(rows),
        })
      );
    }
  } catch (err) {
    logger.error("토큰 데이터 조회 실패", err);
    res.send(err);
  }
};

const updateTokenData = async (req, res) => {
  const tokenDataId = req.params.id;

  const {
    tokenName,
    tokenDescription,
    tokenValue,
    tokenCreatedDate,
    tokenExpiryDate,
    notificationOption,
  } = req.body;
  try {
    const query = `UPDATE tokens SET token_name = $1, token_description = $2, token_value = $3, token_created_date = $4, token_expiry_date = $5, notification_option = $6 WHERE id = $7`;
    const values = [
      tokenName,
      tokenDescription,
      tokenValue,
      tokenCreatedDate,
      tokenExpiryDate,
      notificationOption,
      tokenDataId,
    ];

    await client.query(query, values);

    logger.info(":201:PATCH /token/:id 토큰 데이터 수정 성공");
    return res.send({ success: true });
  } catch (err) {
    logger.error("토큰 데이터 수정 실패", err);
    return res.send(err);
  }
};

const deleteTokenData = async (req, res) => {
  const tokenDataId = req.params.id;
  const { user_id } = req;

  console.log("id => ", tokenDataId);
  console.log("user_id => ", user_id);

  try {
    const query = `DELETE FROM tokens WHERE id = $1 AND user_id = $2`;
    const values = [tokenDataId, user_id];

    await client.query(query, values);

    logger.info(":204:DELETE /token/:id 토큰 데이터 삭제 성공");
    return res.send({ success: true });
  } catch (err) {
    logger.error("토큰 데이터 삭제 실패", err);
    return res.send(err);
  }
};

module.exports = {
  getMyTokenDatas: getAllTokenData,
  saveTokenData,
  getTokenData,
  updateTokenData,
  deleteTokenData,
};
