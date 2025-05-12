const User = require("../modles/userModel");
const errorHandling = require("../utils/errorHandling");
const bcrypt = require("bcryptjs");
const { doValidations } = require("../utils/doValidations")
const { successMessage } = require("../utils/sucessMessage");
const { capaitlize } = require("../utils/capitalizedFirstLetter");
const user = require("../modles/userModel");
const jwt=require("jsonwebtoken");


// @method POST
// @desc:controller to create new admin or user
// @endpoint: localhost:6000/api/admin/create-admin
//   or
// @endpoint: localhost:6000/api/user/user-login

module.exports.createUserAndAdmin = async (req, res, next) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) return next(new errorHandling("Empty body field please fill the form.", 400));
        const requireFieds = ["name", "gender", "phone", "email", "address", "password", "confirmPassword"];
        const check = requireFieds.filter(key => !Object.keys(req.body).includes(key) || !req.body[key] || req.body[key].toString().trim() === "");
        if (check.length !== 0) return next(new errorHandling(`${check.join()} ${check.length > 1 ? "fields are" : "field is"} missing.`, 400));
        const message = doValidations(req.body.email, req.body.phone, req.body.password, req.body.confirmPassword);
        if (message) return next(new errorHandling(message, 400));
        const data = {}
        
        if (req.user.role === "admin" && req.originalUrl === process.env.adminCreateRoute) {
            data["role"] = "admin"
        }
        req.body["name"] = capaitlize(req.body.name)
        for (let key in requireFieds) {
            key = requireFieds[key];
            if (key === "confirmPassword") continue;
            if (key === "password") {
                data[key] = await bcrypt.hash(req.body[key], 10);
                continue;
            }
            data[key] = req.body[key];

        }
        // console.log(req.originalUrl)
        // console.log(data)
        const createUser = await User.create(data);
        if (!createUser) return next(new errorHandling("Cannot create a user please try again later.", 500));
        successMessage(res, `${req.body.name} created sucessfully`, 200)

    } catch (error) {
        // console.log(error)
        if (error.code === 11000) return next((new errorHandling("The email address is already in use.Please try to create with another email", error.statusCode || 400)));
        return next((new errorHandling(error.message, error.statusCode || 500)));

    }
}
module.exports.updateUserOrAdmin = async (req, res, next) => {
    try {
        const userId = req.user.userId;//from checkJwt controller
        if (!userId) return next(new errorHandling("Something went wrong.", 400));
        if(!req.body.currentPassword || req.body["currentPassword"].trim()===""  )return next(new errorHandling("Please enter current password to update details",400));
        const checkPass=await User.findById(userId,"+password +name")
        const check=await bcrypt.compare(req.body.currentPassword, checkPass.password);
        if(!check)return next(new errorHandling("Password doesnot match.",400));
        if (!req.body) return next(new errorHandling("Please provide the body.", 400));
        const possibleFields = ["name", "gender", "phone", "email", "address", "password", "confirmPassword"];
        const filterField = Object.keys(req.body).filter(key => possibleFields.includes(key) && req.body[key] && req.body[key].toString().trim() !== "");
        if (!filterField || filterField.length === 0) return next(errorHandling("Please provide data to update.", 400));
        const message = doValidations(req.body.email, req.body.phone, req.body.password, req.body.confirmPassword)
        if (message) return next(new errorHandling(message, 400));
        const updatedData = {}
        for (const key of filterField) {
            if(key==="name") req.body[key]=capaitlize(req.body["name"])
            if (key === "password") req.body[key] = await bcrypt.hash(req.body[key], 10);
            if(key==="confirmPassword")continue;
            updatedData[key] = req.body[key];
        };

        const updateUser = await User.findByIdAndUpdate(userId, updatedData);
        if(!updateUser) return next(new errorHandling("Cannot update the user.Please try again later",500));
        successMessage(res,`${checkPass.name}User updated sucessfully`,200);



    } catch (error) {
        // console.log(error)code: 
        if(error.code===11000)return next(new errorHandling("Email is already in use please try different email.",400))
        return next(new errorHandling(error.message, error.statusCode || 500))
    }
}
// @method delete
// @desc:controller to delete new admin
// @endpoint: localhost:6000/admin/delete-admin
module.exports.deleteAdminOrUser = async (req, res, next) => {
    try {
       const userId = req.user.userId;//from checkJwt controller
        if (!userId) return next(new errorHandling("Something went wrong.", 400));
        if(!req.body)return next(new errorHandling("Please provide currentPassword.", 400));
        if(!req.body.currentPassword || req.body["currentPassword"].trim()===""  )return next(new errorHandling("Please enter current password to delete your account.",400));
        
        const checkPass=await User.findById(userId,"+password +name")
        const check=await bcrypt.compare(req.body.currentPassword, checkPass.password);
        if(!check)return next(new errorHandling("Password doesnot match.",400));
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
        return next(new errorHandling(error.message, error.statusCode || 500));

    }

}
// forgot
// reset

