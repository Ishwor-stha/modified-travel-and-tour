const express = require("express");
const Router = express.Router();
const {bookTour,enquiry} = require("../controller/tourController.js");
const {payWithEsewa,paymentSucess,paymentFailure}=require("../controller/paymentController.js")
/*********************************Route****************************************************** */


Router.route("/first-book-tour").post(bookTour);
Router.route("/enquiry").post(enquiry);

Router.route("/pay-with-esewa").post(payWithEsewa);
Router.route("/:transactionId/payment-success").get(paymentSucess)
Router.route("/payment-failure").get(paymentFailure)
// Router.route("/:transactionId/payment-success").all(paymentSucess)
// Router.route("/payment-failure").all(paymentFailure)



module.exports = Router;
