const client = require("../config/db");

const deleteAccount = async (req, res) => {
  const { user_id } = req;

  try {
    const query = `DELETE FROM users WHERE id = $1`;
    const values = [user_id];
    await client.query(query, values);

    return res
      .status(200)
      .send(
        JSON.stringify({ success: true, message: "회원탈퇴가 완료되었습니다" })
      );
  } catch (err) {
    logger.error(err);
    console.error(err);
    res.status(500).send(
      JSON.stringify({
        success: false,
        message: "알 수 없는 오류가 발생했습니다",
      })
    );
  }
};

module.exports = { deleteAccount };
