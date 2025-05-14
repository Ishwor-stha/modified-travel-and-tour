const errorHandling = require("../utils/errorHandling");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const { validateEmail } = require("../utils/emailValidation");
const { messages } = require("../utils/message");
// const sendMessage = require("../utils/sendMessage");
const { sendMessage } = require("../utils/nodemailer");
const { successMessage } = require("../utils/sucessMessage");
// const { doValidations } = require("../utils/doValidations");
// const { capaitlize } = require("../utils/capitalizedFirstLetter");
const User=require("../modles/userModel");

const restrict=(role,urlFromClient,validUrl)=>{
    const onlyUrl=urlFromClient.split("?")[0]
    return role==="admin"&& onlyUrl===validUrl
}

// @method GET
// @desc:controller to get all admin
// @endpoint: localhost:6000/admin/get-admins
module.exports.getAllAdmin = async (req, res, next) => {
    try { 
        if(!restrict(req.user.role,req.originalUrl,process.env.adminGetRoute))return next(new errorHandling("You donot have permission to perform this task.", 400));
       
        let { page = 1 } = req.query;
        page = Math.ceil(page);
        const limit = 10;
        const skip = (page - 1) * limit;
        let trueOrFalse
        if(req.query.isDeleted==="true")trueOrFalse=true;
        else trueOrFalse=false; 
        const allAdmin = await User.find({role:"admin",isDeleted:trueOrFalse}, "-_id -password").skip(skip).limit(limit);;//exclude _id and password
        // if there is no admin
        if (!allAdmin || allAdmin.length === 0) return next(new errorHandling("No Admin found in database.", 404));

        res.status(200).json({
            pageNo: page,
            totalAdmin: allAdmin.length,
            status: true,
            allAdmin
        });
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));

    }
}



// module.exports.getAdminByEmailOrName = async (req, res, next) => {

//     if (!req.query.email && !req.query.name) return next(new errorHandling("Invalid request please provide email or name.", 400));
//     try {
//         let details;
//         if (req.query.email) {
//             if(!validateEmail(req.query.email))return next(new errorHandling("Invalid email address.Please use valid email address", 400));
//             details = await admin.find({ "email": req.query.email });
//         }
//         if (req.query.name) {
//             const checkName = req.query.name.split("{##$}");
//             // console.log(checkName)
//             if (checkName.length === 1 && checkName[0] === " ") return next(new errorHandling("Invalid name.Please use valid name.", 400))
//             const name = req.query.name.trim()
//             details = await admin.find({ "name": { $regex: new RegExp(`^${name}$`, 'i') } });
//         }
//         if (!details || Object.keys(details).length === 0) return next(new errorHandling(`No admin found by given ${req.query.email ? "email" : "name"}.`, 404));
//         res.status(200).json({
//             status: true,
//             details
//         });
//     } catch (error) {
//         return next(new errorHandling(error.message, error.statusCode || 500));

//     }
// }





// @method DELETE
// @desc:controller delete cookie from the user
// @endpoint: localhost:6000/admin/logout-admin
module.exports.logout = (req, res, next) => {
    try {
        const token = req.cookies.auth_token;
        if (!token) return next(new errorHandling("Please login to be able to logout.", 403));
        let check;
        try {
            check = jwt.verify(token, process.env.SECRETKEY);
        } catch (err) {
            return next(new errorHandling("Invalid token. Please clear the browser and login again.", 400));
        }
        // if token verification fails
        if (!check) return next(new errorHandling("Invalid token given.Please clear the browser and login again.", 400));
        //clear the cookie from browser
        res.clearCookie('auth_token', {
            httpOnly: true,
            sameSite: "Strict"
        });
        successMessage(res, "You have been logged out.", 200);

    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}

// }
// @method delete
// @desc:controller to delete new admin
// @endpoint: localhost:6000/admin/delete-admin
// module.exports.removeAdmin = async (req, res, next) => {
//     try {
//         const adminId = req.params.id;//from url
//         if (!adminId) return next(new errorHandling("No admin admin id is provided please try again.", 400));
//         const del = await admin.findByIdAndUpdate(adminId, { isDeleted: true });
//         // check if admin is deleted
//         // if (!del) {
//         if (!del) {
//             throw new errorHandling("Failed to remove admin.Please try again.", 500);
//         }
//         successMessage(res, "Admin removed successfully.", 200);

//     } catch (error) {
//         return next(new errorHandling(error.message, error.statusCode || 500));

//     }

// }

// @endpoint:localhost:6000/admin/forget-password
// @desc:forget password also send gmail
// @method:POST
module.exports.forgotPassword = async (req, res, next) => {
    try {
        // destructuring
        let { email } = req.body;
        if (!email) return next(new errorHandling("Please enter email address.", 400));
        // validate email
        if (!validateEmail(email)) {
            return next(new errorHandling("Please enter valid email address.", 400));
        }
        // check email in database
        const findMail = await User.findOne({ email }, "-_id -password -code -resetExpiry");//exclude _id, password, code, and resetExpiry
        // no email
        if (!findMail) {
            return next(new errorHandling("Email not found.Please enter correct email address.", 404));
        }

        //                               message part
        //generate  token
        const passwordResetToken = crypto.randomBytes(16).toString('hex');

        // Set expiration time (e.g., 1 hour from now)
        const expirationTime = Date.now() + 900000; // 15 minutes in milliseconds
        // update code and expiry time
        const updatedUser = await User.findByIdAndUpdate(findMail._id, { "code": passwordResetToken, "resetExpiry": expirationTime });
        if (!updatedUser) {
            return next(new errorHandling("Failed to update reset token. Admin not found.", 404));
        }
        // Create the reset link
        let resetLink
        if(findMail.role=="admin") resetLink = `${process.env.URL}/admin/reset-password/${passwordResetToken}`;
        else resetLink = `${process.env.URL}/user/reset-password/${passwordResetToken}`;
        // Construct the email message
        const message = messages(resetLink);

        // send message
        await sendMessage(res, findMail.email, "Reset link", message);
        // await sendMessage(next, message, "Reset link", findMail.email, findMail.name);
        successMessage(res, "Password reset email has been sent to your email address.", 200);

    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}

// @desc: reset link with code
// @method: PATCH
// @endpoint:localhost:6000/reset-password/:code
module.exports.resetPassword = async (req, res, next) => {
    try {
        // Check if password and confirmPassword are provided
        if (!req.body.password || !req.body.confirmPassword) {
            return next(new errorHandling("Confirm password or password is missing. Please try again.", 400));
        }
        // destructuring
        let { password, confirmPassword } = req.body;

        // Check if the password and confirmPassword match
        if (password !== confirmPassword) {
            return next(new errorHandling("Password and confirm password do not match. Please enter correct password.", 400));
        } else {
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
            // Remove confirmPassword from the request body
            req.body.confirmPassword = undefined;
        }

        // Check if reset code is provided
        if (!req.params.code) {
            return next(new errorHandling("Unauthorized: Reset code missing", 400));
        }

        let code = req.params.code;

        // Find the admin using the reset code
        let adminCode = await admin.findOne({ code });
        // no admin
        if (!adminCode) {
            return next(new errorHandling("Code expired or invalid. Please request a new one.", 400));
        }

        // Check if the reset code has expired
        const currentDate = Date.now();
        // if time of database is lower than current time
        if (currentDate > adminCode.resetExpiry) {
            // Clear expired reset code fields
            adminCode.resetExpiry = undefined;
            adminCode.code = undefined;
            // dave data in database
            await adminCode.save();

            // Return error response for expired code
            return next(new errorHandling("Code has expired. Please request a new one.", 400));
        }

        // Update the admin's password and clear reset fields
        const changeAdmin = await admin.findByIdAndUpdate(
            adminCode._id,
            {
                "password": req.body.password,

            },
            {
                new: true // Return the updated document
            }
        );

        // after updating set the expiry date and code to undefined
        changeAdmin.resetExpiry = undefined;
        changeAdmin.code = undefined;
        // saving changes in database
        await changeAdmin.save();


        if (!changeAdmin) {
            return next(new errorHandling("Error updating password.Please try again.", 500));
        }

        // Return success response
        successMessage(res, "Password changed successfully.", 200);

    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
};
