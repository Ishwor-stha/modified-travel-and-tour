const express=require("express");
const  {getAllAdmin,logout,removeAdmin,forgotPassword,resetPassword,getAdminAndUserByEmailOrName,getUserOrAdminById}  = require("../controller/authController");
const {checkIfDeleted,login}=require("../controller/loginController")
const {createUserAndAdmin,updateUserOrAdmin,deleteAdminOrUser}=require("../controller/userController")
const {checkJwt}=require("../middlewares/checkjwt")


const Router=express.Router();

Router.route("/get-admins").get(checkJwt,getAllAdmin);

Router.route("/get").get(checkJwt,getAdminAndUserByEmailOrName)

Router.route("/get-admin/").get(checkJwt,getUserOrAdminById)

Router.route("/create-admin/").post(checkJwt,createUserAndAdmin);

Router.route("/login-admin/").post(checkIfDeleted,login);

Router.route("/logout-admin/").delete(checkJwt,logout);

Router.route("/update-admin/").patch(checkJwt, updateUserOrAdmin);

Router.route("/remove-admin/:id").delete(checkJwt, removeAdmin);

Router.route("/delete-account").delete(checkJwt,deleteAdminOrUser)

Router.route("/forget-password").post( forgotPassword);

Router.route("/reset-password/:code").patch(resetPassword);



module.exports=Router;