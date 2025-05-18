const express=require("express");
const  {createAdmin,updateAdmin,deleteAdmin,getAllAdmin,logout,removeAdmin,
        forgotPassword,resetPassword,getAdminByEmailOrName,getAdminById}  = require("../controller/authController");
const {checkIfDeleted,login}=require("../controller/loginController")
const {checkJwt}=require("../middlewares/checkjwt")


const Router=express.Router();

Router.route("/get-admins").get(checkJwt,getAllAdmin);

Router.route("/get").get(checkJwt,getAdminByEmailOrName)

Router.route("/get-admin/").get(checkJwt,getAdminById)

Router.route("/create-admin/").post(checkJwt,createAdmin);

Router.route("/login-admin/").post(checkIfDeleted,login);

Router.route("/logout-admin/").delete(checkJwt,logout);

Router.route("/update-admin/").patch(checkJwt, updateAdmin);

Router.route("/remove-admin/:id").delete(checkJwt, removeAdmin);

Router.route("/delete-account").delete(checkJwt,deleteAdmin)

Router.route("/forget-password").post( forgotPassword);

Router.route("/reset-password/:code").patch(resetPassword);



module.exports=Router;