require("dotenv").config();
const logger = require("../config/logger");
const nodemailer = require("nodemailer"); // 모듈 import
const bcrypt = require("bcrypt");
const transporter = nodemailer.createTransport({
  service: "gmail", // gmail을 사용함
  auth: {
    user: process.env.GMAIL_EMAIL, // 나의 (작성자) 이메일 주소
    pass: process.env.GMAIL_PASSWORD, // 이메일의 비밀번호
  },
});

const jwt = require("jsonwebtoken");
const client = require("../config/db");
const {
  REFRESH_TOKEN_EXPIRY_TIME,
  ACCESS_TOKEN_EXPIRY_TIME,
} = require("./constants");

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

    console.log("accessToken => ", accessToken);
    console.log("refreshToken => ", refreshToken);

    res.setHeader("authorization", `Bearer ${accessToken}`);
    res.setHeader("Cache-Control", "no-store");

    console.log(res);
    return res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      })
      .send(JSON.stringify({ accessToken }));
  } catch (err) {
    logger.error(err);
    console.error(err);
  }

  // res.send(JSON.stringify({ data: null }));
};

const signUp = async (req, res) => {
  const { email, password } = req.body;

  // TODO:
  // 1. password bcrypt 모듈로 암호화 해야함.
  // 2. 비대칭키로 프론트에서 백엔드 넘어오는 password 암호화.

  const createNewUserDataQuery = {
    query: `INSERT INTO users(email, password) VALUES ($1, $2)`,
    values: [email, password],
  };

  await client.query(
    createNewUserDataQuery.query,
    createNewUserDataQuery.values
  );
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

const verifyEmail = async (req, res) => {
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
  console.log("is working");

  const mailOptions = {
    from: process.env.GMAIL_EMAIL, // 작성자
    to: email, // 수신자
    subject: "APIKeyPER Sign Up Verification Code", // 메일 제목
    text: "111111", // 메일 내용
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      logger.error(error);
      res
        .status(500)
        .send({ success: false, message: "인증메일 발송에 실패했습니다" });
    } else {
      logger.info("Verification Email sent: " + info.response);
      res.status(201).send({
        success: true,
        message: "인증메일이 성공적으로 발송되었습니다",
      });
    }
  });
};

module.exports = { logIn, signUp, logOut, verifyEmail };
