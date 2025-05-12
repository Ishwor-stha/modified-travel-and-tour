const express=require("express")
const Router=express.Router();
const {createUserAndAdmin,updateUserOrAdmin}=require("../controller/userController");
const {checkIfDeleted,login}=require("../controller/loginController")
const {checkJwt}=require("../middlewares/checkjwt")

Router.route("/create-user").post(createUserAndAdmin)
Router.route("/user-login").post(checkIfDeleted,login)
Router.route("/user-update").patch(checkJwt,updateUserOrAdmin)

module.exports=Router;