const express=require("express")
const Router=express.Router();
const {createUserAndAdmin,updateUserOrAdmin,deleteAdminOrUser}=require("../controller/userController");
const{resetPassword,forgotPassword,getUserOrAdminById}=require("../controller/authController")
const {checkIfDeleted,login}=require("../controller/loginController")
const {checkJwt}=require("../middlewares/checkjwt")


Router.route("/get-user/").get(checkJwt,getUserOrAdminById)

Router.route("/create-user").post(createUserAndAdmin)
Router.route("/user-login").post(checkIfDeleted,login)
Router.route("/user-update").patch(checkJwt,updateUserOrAdmin)
Router.route("/user-delete").delete(checkJwt,deleteAdminOrUser)
Router.route("/forgot-password").post(forgotPassword)
Router.route("/reset-password/:code").patch(resetPassword);


module.exports=Router;