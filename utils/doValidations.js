const { validateEmail } = require("./emailValidation")
const { isValidNepaliPhoneNumber } = require("./validatePhoneNumber")

module.exports.doValidations=(email,phone,password,confirmPassword)=>{
    if(!validateEmail(email))return "Email is not valid.Please valid email address."
    if(!isValidNepaliPhoneNumber(phone))return "Phone is not valid.Please valid email phone."
    if(password !==confirmPassword)return "Phone is not valid.Please valid email phone."
}