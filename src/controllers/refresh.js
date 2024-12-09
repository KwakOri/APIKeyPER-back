const client = require("../config/db");
const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_EXPIRY_TIME } = require("./constants");
require("dotenv").config();

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.refreshToken) return res.status(401);

  const refreshToken = cookies.refreshToken;
  const query = `SELECT * FROM users WHERE refresh_token = $1`;
  const values = [refreshToken];
  const { rows } = await client.query(query, values);

  console.log("rows => ", rows);

  if (rows.length === 0) return res.sendStatus(404);

  const foundUser = rows[0];

  //evaluate jwt

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
    (err, decoded) => {
      if (err || foundUser.id !== decoded.user_id) return res.sendStatus(401);

      console.log(foundUser.id, decoded.user_id);
      const accessToken = jwt.sign(
        { user_id: foundUser.id },
        process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
        { expiresIn: ACCESS_TOKEN_EXPIRY_TIME }
      );

      console.log("new accessToken => ", accessToken);

      res.setHeader("Authorization", `Bearer ${accessToken}`);

      return res.send(JSON.stringify({ accessToken }));
    }
  );
};

module.exports = { handleRefreshToken };
