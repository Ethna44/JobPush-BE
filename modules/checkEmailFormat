function checkEmailFormat(email) {
   const emailReg = new RegExp(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/i
    );
    
    if (emailReg.test(email)){
          return { result: true };
  } else {
    return {
      result: false,
      error: "Invalid email format. Please enter a valid email address",
    };
  }
    }
   
  
module.exports = { checkEmailFormat };
