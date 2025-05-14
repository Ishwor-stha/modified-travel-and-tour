const { validateEmail } = require("../utils/emailValidation");
const errorHandling = require("../utils/errorHandling");
const userModel=require("../modles/userModel");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const {successMessage}=require("../utils/sucessMessage")

// @method POST
// @desc:controller to check if admin is deleted or not
module.exports.checkIfDeleted = async (req, res, next) => {
    try {
        let { email, password } = req.body;
        // if no email and password
        if (!email || !password) {
            return next(new errorHandlingandling("Email or password is missing.Please try again.", 400));
        }
        email = email.toLowerCase();
        // check email validation 
        if (!validateEmail(email)) {
            return next(new errorHandling("Please enter valid email address.", 400));
        }  
            
        // fetch data from email
        const user = await userModel.findOne({ email });
        
        // no data
        if (!user || user.isDeleted) {
            return next(new errorHandling("Cannot find the user from this email address.", 404));
        }
        req.userData = user;
        // console.log(user)
        next();
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}


// @method POST
// @desc:controller to login
// @endpoint: localhost:6000/admin/login-admin
module.exports.login = async (req, res, next) => {
    try { 
        // compare password
        const isMatch = await bcrypt.compare(req.body.password, req.userData.password);
        // match fails
        if (!isMatch) {
            return next(new errorHandling("Password doesnot match.Please enter correct password.", 400));
        }


        const payload = {
            userId: req.userData._id,
            email: req.userData.email,
            role:req.userData.role
        };
        // generate jwt token
        const token = jwt.sign(payload, process.env.SECRETKEY, { expiresIn: process.env.jwtExpires });
        // send token and store on cookie
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 3600 * 1000
        });
        successMessage(res, `Welcome back ${req.userData.name}.`, 200);


    } catch (error) {

        return next(new errorHandling(error.message, error.statusCode || 500));

    }

}