const client = require("../config/db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  console.log(cookies);

  if (!cookies?.refreshToken) return res.status(401);
  console.log(cookies.refreshToken);

  const refreshToken = cookies.refreshToken;
  const query = `SELECT * FROM users WHERE refresh_token = $1`;
  const values = [refreshToken];
  const { rows } = await client.query(query, values);

  if (rows.length === 0) return res.sendStatus(403);

  const foundUser = rows[0];

  console.log(foundUser);

  //evaluate jwt

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
    (err, decoded) => {
      if (err || foundUser.id !== decoded.user_id) return res.sendStatus(403);

      console.log(foundUser.id, decoded.user_id);
      const accessToken = jwt.sign(
        { user_id: foundUser.id },
        process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
        { expiresIn: "30s" }
      );

      console.log("new accessToken => ", accessToken);

      return res
        .header({ Authorization: accessToken })
        .send(JSON.stringify({ accessToken }));
    }
  );
};

module.exports = { handleRefreshToken };
