function checkPassword(password, confirmPassword) {
  if (password === confirmPassword) {
    return { result: true };
  } else {
    return {
      result: false,
      error: "Passwords doesn't match. Please Try Again.",
    };
  }
}

module.exports = { checkPassword };
