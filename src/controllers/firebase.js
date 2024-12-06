const logger = require("../config/logger");
const NotificationService = require("../service/NotificationService");

const sendFirebaseNotification = async (req, res) => {
  try {
    const { title, body, deviceToken } = req.body;

    const result = await NotificationService.sendNotification(
      deviceToken,
      title,
      body
    );
    console.log("result => ", result);

    logger.info(":201: POST /api/firebase/send-notification message 전송 성공");
    res
      .status(200)
      .json({ message: "Notification sent successfully", success: true });
  } catch (err) {
    res;

    logger
      .error(":500: POST /api/firebase/send-notification message 전송 실패")
      .status(500)
      .json({ message: "Error sending notification", success: false });
  }
};

const sendScheduledNotification = async () => {
  const title = "Every minutes";
  const body = "Hello";
  const deviceToken =
    "c_J4p0NZoM87lb8Szwi473:APA91bGWFvrIaZSf9JBsnxkdgVkrRxg5VPH5mngnrbiOkR6SLwepcmL0KD2xRrMctWzo4Cdc3B7sagwqb1uiXFI-_2jflLybeR-nL5oTCZA19Kxgd42yPZI";
  try {
    await NotificationService.sendNotification(deviceToken, title, body);
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = { sendFirebaseNotification, sendScheduledNotification };
