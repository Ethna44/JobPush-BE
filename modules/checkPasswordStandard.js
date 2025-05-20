function checkPasswordStandard(password) {
  const passwordReg = new RegExp(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/

    //      Au moins 8 caractères
    // Au moins 1 lettre majuscule

    // Au moins 1 lettre minuscule

    // Au moins 1 chiffre

    // Au moins 1 caractère spécial
  );
  if (passwordReg.test(password)) {
    return { result: true };
  } else {
    return {
      result: false,
      error:
        "Password must be at least 8 characters long and include one uppercase letter (e.g. A), one lowercase letter (e.g. a), one number (e.g. 1), and one special character (e.g. !, @, #, $).",
    };
  }
}
module.exports = { checkPasswordStandard };
