const express=require("express");
const  {checkJwt,getAllAdmin,createAdmin,login,logout,updateAdmin,removeAdmin,forgotPassword,resetPassword,checkIfDeleted,getAdminByEmailOrName}  = require("../controller/authController");


const Router=express.Router();

Router.route("/get-admins").get(checkJwt,getAllAdmin);

Router.route("/get-admin").get(checkJwt,getAdminByEmailOrName)

Router.route("/create-admin/").post(checkJwt,createAdmin);

Router.route("/login-admin/").post(checkIfDeleted,login);

Router.route("/logout-admin/").delete(checkJwt,logout);

Router.route("/update-admin/").patch(checkJwt, updateAdmin);

Router.route("/remove-admin/:id").delete(checkJwt, removeAdmin);

Router.route("/forget-password").post( forgotPassword);

Router.route("/reset-password/:code").patch(resetPassword);



module.exports=Router;