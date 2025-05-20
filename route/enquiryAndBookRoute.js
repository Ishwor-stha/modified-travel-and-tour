const express = require("express");
const Router = express.Router();
const {bookTour,enquiry} = require("../controller/tourController.js");
const { checkJwt } = require("../middlewares/checkjwt.js");

/*********************************Route****************************************************** */


// Router.route("/book-tour").post(bookTour);

Router.route("/enquiry").post(enquiry);


module.exports = Router;
