const express = require("express");
const Router = express.Router();
const { postTour, updateTour, deleteTour, getOneTour, getTours, getOneTourById,
    createDescriptionOfTour, updateTourDescription, getOneTourDescriptionId, uploadImageForTour, deleteOneImageOfTour} = require("../controller/tourController.js");
const { checkJwt } = require("../middlewares/checkjwt.js");



const multer = require('multer');
const { storage } = require('../utils/clouudinary.js');
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }
});






/*********************************Route**************a**************************************** */
Router.route("/get-tours").get(getTours);

Router.route('/get-tour/:id').get(getOneTourById)

Router.route("/tour-admin/post-tour").post(checkJwt, upload.single('thumbnail'), postTour);



Router.route("/tour-admin/update-tour/:id").patch(checkJwt, upload.single('thumbnail'), updateTour);

Router.route("/create-description/:tourId").post(checkJwt, createDescriptionOfTour)

Router.route("/update-description/:tourId").patch(checkJwt, updateTourDescription)

Router.route("/get-description/:tourId").get(getOneTourDescriptionId)




Router.route("/tour-admin/delete-tour/:id").delete(checkJwt, deleteTour);

Router.route("/get-tour-by-slug/:slug").get(getOneTour);

Router.route("/tours/:id/images").post(checkJwt, upload.array('images', 10), uploadImageForTour);

Router.route("/delete/:tourId/images/:publicId").delete(checkJwt, deleteOneImageOfTour);



module.exports = Router;
