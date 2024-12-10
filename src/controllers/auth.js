require("dotenv").config();
const logger = require("../config/logger");
const nodemailer = require("nodemailer"); // 모듈 import
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const client = require("../config/db");
const {
  REFRESH_TOKEN_EXPIRY_TIME,
  ACCESS_TOKEN_EXPIRY_TIME,
  EMAIL_VERIFICATION_TOKEN_EXPIRY_TIME,
} = require("./constants");

const transporter = nodemailer.createTransport({
  service: "gmail", // gmail을 사용함
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

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
  }

  // res.send(JSON.stringify({ data: null }));
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

    const verificationToken = jwt.sign(
      {
        email,
      },
      process.env.JWT_EMAIL_VERIFICATION_TOKEN_SECRET_KEY,
      {
        expiresIn: EMAIL_VERIFICATION_TOKEN_EXPIRY_TIME,
      }
    );

    const mailOptions = {
      from: process.env.GMAIL_EMAIL, // 작성자
      to: email, // 수신자
      subject: "APIKeyPER Sign Up Verification Code", // 메일 제목
      html: `<p>Please click the following link to verify your email address:</p>
      <p> <a href="${process.env.SERVER_DOMAIN}/api/auth/sign-up/verification/email/${verificationToken}">Verify email</a> </p>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        transporter.close();
        logger.error(error);
        res.status(500).send(
          JSON.stringify({
            success: false,
            message: "인증메일 발송에 실패했습니다",
          })
        );
      } else {
        transporter.close();
        logger.info("Verification Email sent: " + info.response);
        res.status(201).send(
          JSON.stringify({
            success: true,
            message:
              "회원가입에 성공했습니다. 메일함에서 인증메일을 확인해주세요.",
          })
        );
      }
    });
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
};

const verifyEmailVerificationToken = async (req, res) => {
  console.log(req.params);
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
};

module.exports = {
  logIn,
  signUp,
  logOut,
  validateEmail,
  verifyEmailVerificationToken,
};
