const logger = require("../config/logger");

const jwt = require("jsonwebtoken");
const client = require("../config/db");

const logIn = async (req, res) => {
  const { email, password } = req.body;

  const query = `SELECT * FROM users WHERE email = $1`;
  const values = [email];
  const { rows } = await client.query(query, values);

  if (rows.length === 0)
    return res.status(404).send(
      JSON.stringify({
        success: false,
        message: "등록되지 않은 이메일입니다.",
      })
    );

  if (password !== rows[0].password)
    return res.status(404).send(
      JSON.stringify({
        success: false,
        message: "비밀번호가 일치하지 않습니다.",
      })
    );

  const { id: userId } = rows[0];

  try {
    const accessToken = jwt.sign(
      {
        user_id: userId,
      },
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
      {
        expiresIn: "15s",
      }
    );

    const refreshToken = jwt.sign(
      {
        user_id: userId,
      },
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );

    const query = `UPDATE users SET refresh_token = $1 WHERE id = $2`;
    const values = [refreshToken, userId];
    await client.query(query, values);

    return res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      })
      .header({ Authorization: accessToken })
      .send(JSON.stringify({ accessToken }));
  } catch (err) {
    logger.error(err);
    console.error(err);
  }

  // res.send(JSON.stringify({ data: null }));
};

const signUp = () => {};

const logOut = async (req, res) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.refreshToken) return res.sendStatus(204);

    const refreshToken = cookies.refreshToken;
    const isRefreshTokenInDB = {
      query: `SELECT * FROM users WHERE refresh_token = $1`,
      values: [refreshToken],
    };

    const { rows } = await client.query(
      isRefreshTokenInDB.query,
      isRefreshTokenInDB.values
    );

    if (rows.length === 0) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
      });
      return res.sendStatus(204);
    }
    console.log("user_id => ", rows[0].id);
    const deleteRefreshTokenQuery = {
      query: `UPDATE users SET refresh_token = null WHERE id = $1`,
      values: [rows[0].id],
    };

    await client.query(
      deleteRefreshTokenQuery.query,
      deleteRefreshTokenQuery.values
    );
    res.clearCookie("refreshToken", {
      httpOnly: true,
    });
    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
  }
};

module.exports = { logIn, signUp, logOut };
