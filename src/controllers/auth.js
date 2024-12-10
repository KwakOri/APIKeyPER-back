require("dotenv").config();
const logger = require("../config/logger");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const client = require("../config/db");
const {
  REFRESH_TOKEN_EXPIRY_TIME,
  ACCESS_TOKEN_EXPIRY_TIME,
  EMAIL_VERIFICATION_TOKEN_EXPIRY_TIME,
} = require("./constants");
const Mail = require("../service/MailService");
const MailService = require("../service/MailService");

const logIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const findEmailQuery = {
      query: `SELECT * FROM users WHERE email = $1`,
      values: [email],
    };
    const { rows } = await client.query(
      findEmailQuery.query,
      findEmailQuery.values
    );

    if (rows.length === 0)
      return res.status(404).send(
        JSON.stringify({
          success: false,
          message: "등록되지 않은 이메일입니다.",
        })
      );

    const isPasswordCorrect = await bcrypt.compare(password, rows[0].password);

    if (!isPasswordCorrect)
      return res.status(404).send(
        JSON.stringify({
          success: false,
          message: "비밀번호가 일치하지 않습니다.",
        })
      );

    const { id: userId } = rows[0];

    const accessToken = jwt.sign(
      {
        user_id: userId,
      },
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
      {
        expiresIn: ACCESS_TOKEN_EXPIRY_TIME,
      }
    );

    const refreshToken = jwt.sign(
      {
        user_id: userId,
      },
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
      {
        expiresIn: REFRESH_TOKEN_EXPIRY_TIME,
      }
    );

    const query = `UPDATE users SET refresh_token = $1 WHERE id = $2`;
    const values = [refreshToken, userId];
    await client.query(query, values);

    res.setHeader("authorization", `Bearer ${accessToken}`);
    res.setHeader("Cache-Control", "no-store");

    return res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      })
      .send(JSON.stringify({ accessToken }));
  } catch (err) {
    logger.error(err);
    console.error(err);
    res.status(500).send(
      JSON.stringify({
        success: false,
        message: "알 수 없는 에러가 발생했습니다.",
      })
    );
  }
};

const signUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // bcrypt로 비밀번호 암호화 하기
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // TODO:
    // 1. password bcrypt 모듈로 암호화 해야함.
    // 2. 비대칭키로 프론트에서 백엔드 넘어오는 password 암호화.

    const createNewUserDataQuery = {
      query: `INSERT INTO users(username, email, password) VALUES ($1, $2, $3)`,
      values: [username, email, hashedPassword],
    };

    await client.query(
      createNewUserDataQuery.query,
      createNewUserDataQuery.values
    );

    MailService.sendVerificationMail(email);
  } catch (err) {
    console.error(err);
  }
};

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

const validateEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const isExistingUserQuery = {
      query: `SELECT * FROM users WHERE email = $1`,
      values: [email],
    };
    const { rows: existingUser } = await client.query(
      isExistingUserQuery.query,
      isExistingUserQuery.values
    );
    const isExist = existingUser.length > 0;
    if (isExist)
      return res.status(400).send(
        JSON.stringify({
          success: false,
          message: "이미 등록된 이메일입니다.",
        })
      );
    return res.status(200).send(
      JSON.stringify({
        success: true,
        message: "사용 가능한 이메일입니다.",
      })
    );
  } catch (err) {
    logger.error(err);
    console.error(err);
    res.status(500).send(
      JSON.stringify({
        success: false,
        message: "알 수 없는 에러가 발생했습니다.",
      })
    );
  }
};

const verifyEmailVerificationToken = async (req, res) => {
  try {
    if (!req.params?.token)
      return res.status(400).send(
        JSON.stringify({
          success: false,
          message: "인증토큰이 존재하지 않습니다.",
        })
      );
    const verificationToken = req.params.token;

    jwt.verify(
      verificationToken,
      process.env.JWT_EMAIL_VERIFICATION_TOKEN_SECRET_KEY,
      async (err, decoded) => {
        if (err || !decoded?.email) return res.sendStatus(401);

        const userEmail = decoded.email;
        const query = `UPDATE users SET is_verified = 'true' WHERE email = $1 `;
        const values = [userEmail];
        try {
          await client.query(query, values);
          logger.info(`${userEmail}, 이메일 인증 성공`);
          return res.redirect(`${process.env.DOMAIN}`);
        } catch (err) {
          logger.error(err);
          return res.send(
            JSON.stringify({ success: true, message: "인증에 성공했습니다" })
          );
        }
      }
    );
  } catch (err) {
    logger.error(err);
    console.error(err);
    res.status(500).send(
      JSON.stringify({
        success: false,
        message: "알 수 없는 에러가 발생했습니다.",
      })
    );
  }
};

module.exports = {
  logIn,
  signUp,
  logOut,
  validateEmail,
  verifyEmailVerificationToken,
};
