const express=require("express");
const  admin  = require("../controller/authController");

const Router=express.Router();

Router.route("/get-admins").get(admin.checkJwt, admin.getAllAdmin);

Router.route("/create-admin/").post(admin.checkJwt,admin.createAdmin);

// Router.route("/delete").delete(admin.deleteAll);

Router.route("/login-admin/").post(admin.checkIfDeleted,admin.login);

Router.route("/logout-admin/").delete(admin.checkJwt,admin.logout);

Router.route("/update-admin/").patch(admin.checkJwt, admin.updateAdmin);

Router.route("/remove-admin/:id").delete(admin.checkJwt, admin.removeAdmin);

Router.route("/forget-password").post( admin.forgotPassword);

Router.route("/reset-password/:code").patch(admin.resetPassword);



module.exports=Router;