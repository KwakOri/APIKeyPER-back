require("dotenv").config();
const nodemailer = require("nodemailer"); // 모듈 import
const transporter = nodemailer.createTransport({
  service: "gmail", // gmail을 사용함
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

class MailService {
  static async sendVerificationMail(email) {
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
  }
}

module.exports = MailService;
