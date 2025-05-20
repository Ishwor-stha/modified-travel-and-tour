const express = require("express");
// const upload = require("../utils/multer.js");
const Router = express.Router();
const {postTour,updateTour,deleteTour,getOneTour,bookTour,enquiry,getTours} = require("../controller/tourController.js");
const { checkJwt } = require("../middlewares/checkjwt.js");

/*********************************Route****************************************************** */
Router.route("/get-tours").get(getTours);

Router.route("/tour-admin/post-tour").post(checkJwt, /*upload.array('image', 4),*/ postTour);

Router.route("/tour-admin/update-tour/:id").patch(checkJwt, /*upload.array('image', 4),*/ updateTour);

Router.route("/tour-admin/delete-tour/:id").delete(checkJwt, deleteTour);

Router.route("/get-tour/:slug").get(getOneTour);

// Router.route("/book-tour").post(bookTour);

// Router.route("/enquiry").post(enquiry);


module.exports = Router;
