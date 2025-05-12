const { validateEmail } = require("./emailValidation")
const { isValidNepaliPhoneNumber } = require("./validatePhoneNumber")

module.exports.doValidations=(email,phone,password,confirmPassword)=>{
    if(email !==undefined &&!validateEmail(email))return "Email is not valid.Please valid email address."
    if(phone !== undefined && !isValidNepaliPhoneNumber(phone))return "Phone is not valid.Please valid email phone."
    if(password !==undefined && password !==confirmPassword)return "Password and confirm password doesnot match.."
}