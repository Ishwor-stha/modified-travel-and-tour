const errorHandling = require("../utils/errorHandling");
const admin = require("../modles/adminModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const { validateEmail } = require("../utils/emailValidation");
const { messages } = require("../utils/message");
// const sendMessage = require("../utils/sendMessage");
const {sendMessage}=require("../utils/nodemailer");
const {successMessage} = require("../utils/sucessMessage");
const { log } = require("console");



// @method GET
// @desc:controller to get all admin
// @endpoint: localhost:6000/admin/get-admins
module.exports.getAllAdmin = async (req, res, next) => {
    try {
        const allAdmin = await admin.find({}, "-_id -password");//exclude _id and password
        // if there is no admin
        if (!allAdmin || allAdmin.length===0)return next(new errorHandling("No Admin found in database.",404)); 
        
        res.status(200).json({
            totalAdmin: allAdmin.length,
            status: true,
            allAdmin
        });
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));

    }
}

// @method POST
// @desc:controller to create new admin
// @endpoint: localhost:6000/admin/create-admin
module.exports.createAdmin = async (req, res, next) => {
    try {
        // if there is no password and confirm password
        if (!req.body.password || !req.body.confirmPassword) {
            return next(new errorHandling("Password or confirm password is empty.Please try again.", 400));
        }
        // destructuring the fields from req.body
        let { name, password, confirmPassword, email } = req.body;
        // no name and email
        if (!name || !email) {
            return next(new errorHandling("Name or Email is missing.Please check and try again.", 400));
        }


        // Check if password and confirmPassword match
        if (password !== confirmPassword) {
            return next(new errorHandling("Password or confirm password does not match.Please try again.", 400));

        }
        email=email.toLowerCase();
        // Create new admin in the database
        const newAdmin = await admin.create({
            name,
            password,
            confirmPassword,
            email
        });
        if (!newAdmin || Object.keys(newAdmin).length <= 0) return next(new errorHandling("Cannot create admin.Please try again.", 500));
        // await newAdmin.save();  // Save the admin

        // Respond with success
        successMessage(res, "Admin created successfully.",201);
       
    } catch (error) {
        // Catch validation errors or other errors
        if (error.name === "ValidationError") {
            // console.log("\n")

            return next(new errorHandling(error.message, error.statusCode || 500));
        }
        // catch duplicate key error (e.g., duplicate name or email)
        if (error.code === 11000) {

            return next(new errorHandling("Please try a different name or email.", 409));

        }
        //(server errors)
        return next(new errorHandling("Something went wrong on the server.Please try again.", 500));

    }
};

// @method POST
// @desc:controller to check if admin is deleted or not
module.exports.checkIfDeleted=async(req,res,next)=>{
    try {
        let { email, password } = req.body;
        // if no email and password
        if (!email || !password) {
            return next(new errorHandling("Email or password is missing.Please try again.", 400));
        }
        email=email.toLowerCase();
        // check email validation 
        if (!validateEmail(email)) {
            return next(new errorHandling("Please enter valid email address.", 400));
        }

        // fetch data from email
        const user = await admin.findOne({ email }).select('name isDeleted');
        // no data
        // console.log(user);
        
        if (!user || user.isDeleted) {
            return next(new errorHandling("Cannot find the user from this email address.", 404));
        }
        req.userData=user;
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
        // destrcturing
        // let { email, password } = req.body;
        // // if no email and password
        // if (!email || !password) {
        //     return next(new errorHandling("Email or password is missing.Please try again.", 400));
        // }

        // // check email validation 
        // if (!validateEmail(email)) {
        //     return next(new errorHandling("Please enter valid email address.", 400));
        // }

        // fetch data from email
        // const user = await admin.findOne({ email });
        // // no data
        // if (!user) {
        //     return next(new errorHandling("Cannot find the user from this email address.", 404));
        // }
        // compare password
        const isMatch = await bcrypt.compare(req.body.password, req.userData.password);
        // match fails
        if (!isMatch) {
            return next(new errorHandling("Password doesnot match.Please enter correct password.", 400));
        }


        const payload = {
            userId: req.userData._id,
            email: req.userData.email
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
        successMessage(res,`Hello ${req.userData.name}.`,200);

       
    } catch (error) {

        return next(new errorHandling(error.message, error.statusCode || 500));

    }

}

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

// @method patch
// @desc:controller to create update admin
// @endpoint: localhost:6000/admin/create-admin
module.exports.updateAdmin = async (req, res, next) => {
    try {
        const userId = req.user.userId;//from checkJwt controller
        let details = ["name", "email", "password", "confirmPassword"];
        let updatedData = {};

        // 
        if (req.body.email) {
            //validate email 
            if (!validateEmail(req.body.email)) {
                return next(new errorHandling("Email is not valid .Please enter valid email address.", 400));
            }

        }

        if (req.body.password) {
            // validate password
            if (!req.body.password || !req.body.confirmPassword) {
                return next(new errorHandling("Confirm password of password is missing.Please try again.", 400));
            }
            // compare password
            if (req.body.password !== req.body.confirmPassword) {

                return next(new errorHandling("Confirm Password or Password doesnot match.Please try again.", 400));


            }
            // create password hash
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
            req.body.confirmPassword = undefined;

        }


        // itereate every object of req.body
        for (key in req.body) {
            // check the key macthes to the object of req.body
            if (details.includes(key)) {
                if(key==="email"){
                    req.body["email"]=req.body.email.toLowerCase();
                }
                updatedData[key] = req.body[key];
            }
        }
        
        // update the data in databse
        const updateUser = await admin.findByIdAndUpdate(userId, updatedData);
        // no user
        if (!updateUser) {
            return next(new errorHandling("Cannot update data.Please try again.", 500));
        }
        successMessage(res, "Details updated successfully.", 200);
       
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }

}
// @method delete
// @desc:controller to delete new admin
// @endpoint: localhost:6000/admin/delete-admin
module.exports.removeAdmin = async (req, res, next) => {
    try {
        const adminId = req.params.id;//from url
        if (!adminId) return next(new errorHandling("No admin admin id is provided please try again.", 400));
        const del = await admin.findByIdAndUpdate(adminId,{isDeleted:true});
        // check if admin is deleted
        // if (!del) {
        if (!del) {
            throw new errorHandling("Failed to remove admin.Please try again.", 500);
        }
        successMessage(res, "Admin removed successfully.", 200);
    
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));

    }

}

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
        const findMail = await admin.findOne({ email }, "-_id -password -code -resetExpiry");//exclude _id, password, code, and resetExpiry
        // no email
        if (!findMail ) {
            return next(new errorHandling("Email not found.Please enter correct email address.", 404));
        }

        //                               message part
        //generate  token
        const passwordResetToken =  crypto.randomBytes(16).toString('hex');

        // Set expiration time (e.g., 1 hour from now)
        const expirationTime = Date.now() + 900000; // 15 minutes in milliseconds
        // update code and expiry time
        const updatedAdmin = await admin.findByIdAndUpdate(findMail._id, { "code": passwordResetToken, "resetExpiry": expirationTime });
        if (!updatedAdmin) {
            return next(new errorHandling("Failed to update reset token. Admin not found.", 404));
        }
        // Create the reset link
        const resetLink = `${process.env.URL}/admin/reset-password/${passwordResetToken}`;
        // Construct the email message
        const message = messages(resetLink);

        // send message
        await sendMessage(res,findMail.email,"Reset link",message);
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
