const express=require("express");
const  {getAllAdmin,logout,updateAdmin,removeAdmin,forgotPassword,resetPassword,getAdminByEmailOrName}  = require("../controller/authController");
const {checkIfDeleted,login}=require("../controller/loginController")
const {createUserAndAdmin,updateUserOrAdmin}=require("../controller/userController")
const {checkJwt}=require("../middlewares/checkjwt")


const Router=express.Router();

Router.route("/get-admins").get(checkJwt,getAllAdmin);

Router.route("/get-admin").get(checkJwt,getAdminByEmailOrName)

Router.route("/create-admin/").post(checkJwt,createUserAndAdmin);

Router.route("/login-admin/").post(checkIfDeleted,login);

Router.route("/logout-admin/").delete(checkJwt,logout);

Router.route("/update-admin/").patch(checkJwt, updateUserOrAdmin);

Router.route("/remove-admin/:id").delete(checkJwt, removeAdmin);

Router.route("/forget-password").post( forgotPassword);

Router.route("/reset-password/:code").patch(resetPassword);



module.exports=Router;