
const errorHandling = require("../utils/errorHandling");
const jwt=require("jsonwebtoken")

// @method POST
// @desc:controller to check cookies
module.exports.checkJwt = (req, res, next) => {
    try {
        const token = req.cookies.auth_token;
        // no token
        if (!token) {
            return next(new errorHandling("Please login and try again.", 403));

        }
        // check token
        jwt.verify(token, process.env.SECRETKEY, (err, decode) => {
            if (err) {
                return next(new errorHandling("Your session has been expired.Please login again. ", 403));
            }
            req.user = decode;

            next();
        })
    } catch (error) {
        return next(new errorHandling(error.message, 500));
    }
}