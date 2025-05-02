const express = require("express");
// const upload = require("../utils/multer.js");
const Router = express.Router();
const {postTour,updateTour,deleteTour,getOneTour,bookTour,enquiry} = require("../controller/tourController.js");
const { checkJwt } = require("../controller/authController.js");


/*********************************Route****************************************************** */
Router.route("/get-tours").get(tourController.getTours);

Router.route("/tour-admin/post-tour").post(checkJwt, /*upload.array('image', 4),*/ postTour);

Router.route("/tour-admin/update-tour/:id").patch(checkJwt, /*upload.array('image', 4),*/ updateTour);

Router.route("/tour-admin/delete-tour/:id").delete(checkJwt, deleteTour);

Router.route("/get-tour/:slug").get(getOneTour);

Router.route("/book-tour").post(bookTour);

Router.route("/enquiry").post(enquiry);


module.exports = Router;
