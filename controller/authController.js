const errorHandling = require("../utils/errorHandling");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const { validateEmail } = require("../utils/emailValidation");
const { messages } = require("../utils/message"); // Re-adding this import
const { sendMessage } = require("../utils/nodemailer");
const { successMessage } = require("../utils/sucessMessage");
const { doValidations } = require("../utils/doValidations");
const User = require("../modles/userModel");
const { capaitlize } = require("../utils/capitalizedFirstLetter");
const {databaseConnect}=require("../utils/databaseConnect")

// Helper function to process user data for creation and update
const processUserData = async (body, isUpdate = false) => {
    if (!body || Object.keys(body).length === 0) {
        throw new errorHandling("Empty body field please fill the form.", 400);
    }

    const possibleFields = ["name", "gender", "phone", "email", "address", "password", "confirmPassword"];
    let data = {};

    if (!isUpdate) {
        const requiredFields = ["name", "gender", "phone", "email", "address", "password", "confirmPassword"];
        const missingFields = requiredFields.filter(key => !Object.keys(body).includes(key) || !body[key] || body[key].toString().trim() === "");
        if (missingFields.length !== 0) {
            throw new errorHandling(`${missingFields.join()} ${missingFields.length > 1 ? "fields are" : "field is"} missing.`, 400);
        }
    } else {
        const filterField = Object.keys(body).filter(key => possibleFields.includes(key) && body[key] && body[key].toString().trim() !== "");
        if (!filterField || filterField.length === 0) {
            throw new errorHandling("Please provide data to update.", 400);
        }
    }

    const validationMessage = doValidations(body.email, body.phone, body.password, body.confirmPassword);
    if (validationMessage) {
        throw new errorHandling(validationMessage, 400);
    }

    for (const key of possibleFields) {
        if (body[key] && body[key].toString().trim() !== "") {
            if (key === "name") {
                data[key] = capaitlize(body[key]);
            } else if (key === "password") {
                data[key] = await bcrypt.hash(body[key], 10);
            } else if (key === "confirmPassword") {
                continue; // Skip confirmPassword
            } else {
                data[key] = body[key];
            }
        }
    }
    return data;
};



const GLOBAL_LIMIT = 10; // Define a global constant for pagination limit

// Helper function to handle common catch block logic
const handleControllerError = (error, next) => {
    if (error.code === 11000) {
        return next(new errorHandling("The email address is already in use. Please try to create with another email", error.statusCode || 400));
    }
    return next(new errorHandling(error.message, error.statusCode || 500));
};


// @method POST
// @desc: Controller to create new admin or user
// @endpoint: localhost:6000/api/admin/create-admin/
module.exports.createAdmin = async (req, res, next) => {
    try {
       await  databaseConnect()
        const data = await processUserData(req.body);
        const createUser = await User.create(data);
        if (!createUser) return next(new errorHandling("Cannot create a admin please try again later.", 500));
        successMessage(res, `${req.body.name} created sucessfully`, 200)

    } catch (error) {
        handleControllerError(error, next);
    }
}

// @method PATCH
// @desc: Controller to update admin details
// @endpoint: localhost:6000/api/admin/update-admin/
module.exports.updateAdmin = async (req, res, next) => {
    try {
        await databaseConnect()
        const userId = req.user.userId;//from checkJwt controller
        if (!userId) return next(new errorHandling("Something went wrong.", 400));
        if (!req.body.currentPassword || req.body["currentPassword"].trim() === "") return next(new errorHandling("Please enter current password to update details", 400));
        const checkPass = await User.findById(userId, "+password +name")
        const check = await bcrypt.compare(req.body.currentPassword, checkPass.password);
        if (!check) return next(new errorHandling("Password doesnot match.", 400));
        
        const updatedData = await processUserData(req.body, true);

        const updateUser = await User.findByIdAndUpdate(userId, updatedData);
        if (!updateUser) return next(new errorHandling("Cannot update the user.Please try again later", 500));
        successMessage(res, `${checkPass.name}User updated sucessfully`, 200);



    } catch (error) {
        handleControllerError(error, next);
    }
}

// @method DELETE
// @desc: Controller to delete admin account
// @endpoint: localhost:6000/api/admin/delete-account
module.exports.deleteAdmin = async (req, res, next) => {
    try {
        await databaseConnect()

        const userId = req.user.userId;//from checkJwt controller
        if (!userId) return next(new errorHandling("Something went wrong.", 400));
        if (!req.body) return next(new errorHandling("Please provide currentPassword.", 400));
        if (!req.body.currentPassword || req.body["currentPassword"].trim() === "") return next(new errorHandling("Please enter current password to delete your account.", 400));

        const checkPass = await User.findById(userId, "+password +name")
        const check = await bcrypt.compare(req.body.currentPassword, checkPass.password);
        if (!check) return next(new errorHandling("Password doesnot match.", 400));
        const del = await User.findByIdAndUpdate(userId, { isDeleted: true });
        // check if admin is deleted
        // if (!del) {
        if (!del) {
            throw new errorHandling("Failed to remove admin.Please try again.", 500);
        }
        res.clearCookie('auth_token', {
            httpOnly: true,
            sameSite: "Strict"
        });
        successMessage(res, `${capaitlize(del.role)}removed successfully.`, 200);

    } catch (error) {
        handleControllerError(error, next);
    }

}

// @method GET
// @desc: Controller to get admin details by ID
// @endpoint: localhost:6000/api/admin/get-admin/
module.exports.getAdminById = async (req, res, next) => {
    try {
        await databaseConnect()


        const userId = req.user.userId;
        const user = await User.findById(userId, "-password -isDeleted -role")
        if (!user) return next(new errorHandling(`Cannot get ${req.user.role} from given id.`, 400));
        res.status(200).json({
            status: true,
            userDetail: user
        })


    } catch (error) {
        handleControllerError(error, next);
    }
}



// @method GET
// @desc: Controller to get all admin list (active or deleted)
// @endpoint: localhost:6000/api/admin/get-admins
module.exports.getAllAdmin = async (req, res, next) => {
    try {
        await databaseConnect()


        let { page = 1 } = req.query;
        page = Math.ceil(page);
        const limit = GLOBAL_LIMIT;
        const skip = (page - 1) * limit;
        let trueOrFalse
        if (req.query.isDeleted === "true") trueOrFalse = true;
        else trueOrFalse = false;
        const allAdmin = await User.find({ isDeleted: trueOrFalse }, "-_id -password -role -isDeleted").skip(skip).limit(limit);;//exclude _id and password ....
        // if there is no admin
        if (!allAdmin || allAdmin.length === 0) return next(new errorHandling("No Admin found in database.", 404));

        res.status(200).json({
            pageNo: page,
            totalAdmin: allAdmin.length,
            status: true,
            allAdmin
        });
    } catch (error) {
        handleControllerError(error, next);

    }
}

// @method GET
// @desc: Controller to get admin by email or name
// @endpoint: localhost:6000/api/admin/get
module.exports.getAdminByEmailOrName = async (req, res, next) => {

    try {
        await databaseConnect()


        if (!req.query.email && !req.query.name) return next(new errorHandling("Invalid request please provide email or name.", 400));
        let details;

        if (req.query.email) {
            if (!validateEmail(req.query.email)) return next(new errorHandling("Invalid email address.Please use valid email address", 400));
            details = await User.find({ "email": req.query.email, isDeleted: false }, "-_id -password -role -isDeleted");
        }

        if (req.query.name) {
            const checkName = req.query.name.split("{##$}");
            // console.log(checkName)
            if (checkName.length === 1 && checkName[0] === " ") return next(new errorHandling("Invalid name.Please use valid name.", 400))
            const name = req.query.name.trim()
            details = await User.find(
                {
                    "name": { $regex: new RegExp(`^${name}$`, 'i') },
                    isDeleted: false
                },
                "-_id -password -role -isDeleted"
            );
        }
        if (!details || Object.keys(details).length === 0) return next(new errorHandling(`No admin found by given ${req.query.email ? "email" : "name"}.`, 404));
        res.status(200).json({
            status: true,
            details
        });
    } catch (error) {
        handleControllerError(error, next);

    }
}

// @method DELETE
// @desc: Controller to delete cookie from the user (logout)
// @endpoint: localhost:6000/api/admin/logout-admin/
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
        handleControllerError(error, next);
    }
}


// @method DELETE
// @desc: Controller to remove an admin by ID
// @endpoint: localhost:6000/api/admin/remove-admin/:id
module.exports.removeAdmin = async (req, res, next) => {
    try {
        await databaseConnect()

        const userId = req.params.id;//from url
        if (!userId) return next(new errorHandling(`No ${capaitlize(req.user.role)} id is provided please try again.`, 400));
        const del = await User.findByIdAndUpdate(userId, { isDeleted: true });
        // check if admin is deleted
        // if (!del) {
        if (!del) {
            throw new errorHandling("Failed to remove admin.Please try again.", 500);
        }
        successMessage(res, `${capaitlize(req.user.role)} removed successfully.`, 200);

    } catch (error) {
        handleControllerError(error, next);

    }

}

// @method POST
// @desc: Controller for forgetting password and sending reset email
// @endpoint: localhost:6000/api/admin/forget-password
module.exports.forgotPassword = async (req, res, next) => {
    try {
        await databaseConnect()

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
        if (findMail.role == "admin") resetLink = `${process.env.URL}/admin/reset-password/${passwordResetToken}`;
        else resetLink = `${process.env.URL}/user/reset-password/${passwordResetToken}`;
        // Construct the email message
        const message = messages(resetLink);

        // send message
        await sendMessage(res, findMail.email, "Reset link", message);
        // await sendMessage(next, message, "Reset link", findMail.email, findMail.name);
        successMessage(res, "Password reset email has been sent to your email address.", 200);

    } catch (error) {
        handleControllerError(error, next);
    }
}

// @method PATCH
// @desc: Controller to reset password with code
// @endpoint: localhost:6000/api/admin/reset-password/:code
module.exports.resetPassword = async (req, res, next) => {
    try {
        await databaseConnect()

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
        let adminCode = await User.findOne({ code });
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
        const changeAdmin = await User.findByIdAndUpdate(
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
        handleControllerError(error, next);
    }
};
