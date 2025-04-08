const validator = require("validator");


module.exports. validateEmail = (email) => {
    const isEmail = validator.isEmail(email);
    const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com"];
    const emailDomain = email.split('@')[1]; 
    return isEmail && allowedDomains.includes(emailDomain);
};
