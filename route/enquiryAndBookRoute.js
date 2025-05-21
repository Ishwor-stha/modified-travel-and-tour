const express = require("express");
const Router = express.Router();
const {bookTour,enquiry,payWithEsewa,paymentSucess,paymentFailure} = require("../controller/tourController.js");

/*********************************Route****************************************************** */


Router.route("/first-book-tour").post(bookTour);
Router.route("/pay-with-esewa").post(payWithEsewa);

Router.route("/enquiry").post(enquiry);

Router.route("/payment-success").all(paymentSucess)
Router.route("/payment-failure").all(paymentFailure)



module.exports = Router;
