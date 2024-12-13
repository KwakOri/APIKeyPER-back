class Token {
  static transferToken(token) {
    return {
      tokenName: token.token_name,
      tokenDescription: token.token_description,
      tokenValue: token.token_value,
      tokenCreatedDate: token.token_created_date,
      tokenExpiryDate: token.token_expiry_date,
      notificationOption: token.notification_option,
      id: token.id,
      userId: token.user_id,
    };
  }
  static makeRowsToToken(tokens) {
    const token = tokens[0];
    return this.transferToken(token);
  }

  static makeRowsToTokens(tokens) {
    return tokens.map((token) => {
      return this.transferToken(token);
    });
  }
}

module.exports = Token;
