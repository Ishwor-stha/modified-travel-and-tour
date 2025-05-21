const express = require("express");
const Router = express.Router();
const {firstStepBookTour,enquiry} = require("../controller/tourController.js");
const { checkJwt } = require("../middlewares/checkjwt.js");

/*********************************Route****************************************************** */


Router.route("/first-book-tour").post(firstStepBookTour);

Router.route("/enquiry").post(enquiry);


module.exports = Router;
