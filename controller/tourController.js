const Tour = require("../modles/tourModel");
// const { deleteImage } = require("../utils/deleteImage");
const errorHandler = require("../utils/errorHandling");
// const fs = require("fs");
// const path = require("path");
const { validateEmail } = require("../utils/emailValidation");
// const { bookMessage } = require("../utils/bookingMessage");
const { isValidNepaliPhoneNumber } = require("../utils/validatePhoneNumber");
// const sendMessage = require("../utils/sendMessage");
const { sendMessage } = require("../utils/nodemailer");
const { isValidNumber } = require("../utils/isValidNumber");
const { enquiryMessage } = require("../utils/enquiryMessage");
const { successMessage } = require("../utils/sucessMessage");
const slugify = require("slugify");
const { capaitlize } = require("../utils/capitalizedFirstLetter");
const Description = require("../modles/descriptionModel")
const { databaseConnect } = require("../utils/databaseConnect")
const { cloudinary } = require("../utils/clouudinary")


//@method :GET 
//@Endpoint: localhost:6000/get-tours
//@desc:Getting the array of tours in object
module.exports.getTours = async (req, res, next) => {
    try {
        await databaseConnect()
        let sort;
        let condition = [];
        const fields = ["country", "activity", "grade"];
        let { page = 1 } = req.query;

        // Sorting logic
        if (req.query.originalPrice || req.query.popularity) {
            const { originalPrice, popularity } = req.query;
            if (originalPrice) sort = { originalPrice: originalPrice === "asc" ? 1 : -1 };
            if (popularity) sort = { popularity: popularity === "asc" ? 1 : -1 };
        }

        // Filter logic
        for (let key in req.query) {
            if (fields.includes(key)) {
                condition.push({ [key]: new RegExp(req.query[key], "i") });
            }
        }

        // Build base query
        let query = condition.length > 0 ? { $or: condition } : {};

        // Pagination
        page = parseInt(page);
        page = page > 0 ? page : 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        // Count total results (for pagination info)
        const totalTours = await Tour.countDocuments(query);

        // Build and execute query
        let tours = Tour.find(query, "-popularity").skip(skip).limit(limit);
        if (sort) tours = tours.sort(sort);
        const tourList = await tours;

        // If no results
        if (!tourList || tourList.length === 0) {
            return next(new errorHandler("No tour found in the database.", 404));
        }

        // Respond
        res.status(200).json({
            pageNo: page,
            totalTours,
            status: true,
            tourList,
        });
    } catch (error) {
        next(new errorHandler(error.message || "Something went wrong", error.statusCode || 500));
    }
};


module.exports.getOneTourDescriptionId = async (req, res, next) => {
    try {
        await databaseConnect()

        const { tourId } = req.params;
        if (!tourId) return next(new errorHandler("No id given of tour.Please try again.", 400));
        const tourDescription = await Description.findOne({ "tourId": tourId });
        if (!tourDescription || Object.keys(tourDescription).length === 0) return next(new errorHandler("No tour description found.Please try again.", 404));
        res.status(200).json({
            status: true,
            tourDescription
        });

    } catch (error) {
        return next(new errorHandler(error.message, error.statusCode || 500));
    }
}


module.exports.getOneTourById = async (req, res, next) => {
    try {
        await databaseConnect()

        const { id } = req.params;
        if (!id) return next(new errorHandler("No id given of tour.Please try again.", 400));
        const tour = await Tour.findById(id, "-popularity");
        if (!tour || Object.keys(tour).length === 0) return next(new errorHandler("No tour found.Please try again.", 404));
        res.status(200).json({
            status: true,
            tour
        });

    } catch (error) {
        return next(new errorHandler(error.message, error.statusCode || 500));
    }
}

//@method :GET 
//@Endpoint: localhost:6000/get-one-tour/:slug
//@desc:Getting the detail of  tour 
module.exports.getOneTour = async (req, res, next) => {
    try {
        await databaseConnect()

        const { slug } = req.params;
        if (!slug) return next(new errorHandler("No slug given of tour.Please try again.", 400));
        const tour = await Tour.findOne({ slug: slug }, "-popularity");
        if (!tour || Object.keys(tour).length === 0) return next(new errorHandler("No tour found.Please try again.", 404));
        res.status(200).json({
            status: true,
            tour
        });

    } catch (error) {
        return next(new errorHandler(error.message, error.statusCode || 500));
    }
}

//@EndPoint:localhost:6000/tour-admin/post-tour
//@method:POST
//@desc:Adding the tours
module.exports.postTour = async (req, res, next) => {
    try {
        await databaseConnect()

        const possiblefield = ["tourName", "country", "grade", "activity", "originalPrice", "accomodation", "region", "distance", "startPoint", "discount", "endPoint",
            "duration", "maxAltitude", "mealsIncluded", "groupSize", "natureOfTour", "bestSeason", "activityPerDay", "transportation"];

        const check = possiblefield.filter(key => !Object.keys(req.body).includes(key) || !req.body[key] || req.body[key].toString().trim() === "");

        if (check.length !== 0) return next(new errorHandler(`${check.join(",")} ${check.length > 1 ? "fields are" : "field is"} missing.`));

        if (!req.file || req.file.fieldname !== "thumbnail") return next(new errorHandler("The thumbnail of the image is missing", 400));


        const checkTour = await Tour.find({ tourName: req.body["tourName"] }).select("tourName");


        if (Object.keys(checkTour).length !== 0) return next(new errorHandler("The tour with this name is already exists.", 400));
        let data = {}
        data["thumbnail"] = {
            url: req.file.path,
            public_id: req.file.filename
        };
        for (const key of possiblefield) {
            data[key] = req.body[key];
        }
        if (req.body["discount"]) {
            const price = parseFloat(req.body["originalPrice"]);
            const discount = parseFloat(req.body["discount"]);
            if (Number.isNaN(price) || Number.isNaN(discount)) {
                return next(new errorHandler("Price or Discount must be numbers.", 400));
            }
            data["discountedPrice"] = price - (price * (discount / 100));
            data["discount"] = req.body["discount"];
        }
        if (req.body.popularity) data["popularity"] = req.body["popularity"];
        data["slug"] = slugify(req.body["tourName"]);

        const create = await Tour.create(data);
        if (!create) return next(new errorHandler("Cannot create the tour.Please try again later", 500));
        successMessage(res, `${req.body["tourName"]} created sucessfully.`, 200);

    } catch (error) {
        if (error.code === 11000 || error.code === "E11000") {
            return next(new errorHandler("The tour with this name is already exists.", 400));
        }
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
            } catch (cloudinaryError) {
                console.error("Failed to delete newly uploaded thumbnail after error:", cloudinaryError.message);
            }
        }

        return next(new errorHandler(error.message || "Something went wrong", 500));
    }
}

module.exports.createDescriptionOfTour = async (req, res, next) => {
    try {
        await databaseConnect()

        const { tourId } = req.params;
        if (!tourId) return next(new errorHandler("Tour id is not given.Please provide tour id.", 400));
        if (!req.body) return next(new errorHandler("No body is given.", 400));
        req.body["tourId"] = tourId;
        const possiblefield = ["tourId", "shortDescription", "detailedDescription", "highlights"];
        const check = possiblefield.filter(key => !Object.keys(req.body).includes(key) || !req.body[key] || req.body[key].toString().trim() === "");
        if (check.length !== 0) return next(new errorHandler(`${check.join(",")} ${check.length > 1 ? "fields are" : "field is"} missing.`));
        let data = {}
        for (const key of possiblefield) {
            data[key] = req.body[key];
        }
        const create = await Description.create(data);
        if (!create) return next(new errorHandler("Cannot create the description of tour.Please try again later", 500));
        successMessage(res, `Description created sucessfully.`, 200);

    } catch (error) {

        if (error.code === 11000 || error.code === "E11000") {
            return next(new errorHandler("The tour description of this touur is already exists.", 400));
        }
        return next(new errorHandler(error.message, error.statusCode || 500));
    }
};


// @method PATCH
// @desc:A controller to update the existing data of data base
// @endpoint:localhost:6000/tour-admin/update-tour/:id

module.exports.updateTour = async (req, res, next) => {
    try {
        await databaseConnect();

        const { id } = req.params;
        const tour = await Tour.findById(id);
        if (!tour) return next(new errorHandler("Tour not found", 404));

        const updatedData = {};

        // Handle thumbnail update
        if (req.file && req.file.fieldname === "thumbnail") {

            if (tour.thumbnail && tour.thumbnail.public_id) {
                await cloudinary.uploader.destroy(tour.thumbnail.public_id);
            }

            // Set new thumbnail
            updatedData["thumbnail"] = {
                url: req.file.path,
                public_id: req.file.filename,
            };
        }

        // Update other fields
        const possiblefield = ["tourName", "country", "grade", "activity", "originalPrice", "accomodation", "region", "distance", "startPoint", "discount", "endPoint",
            "duration", "maxAltitude", "mealsIncluded", "groupSize", "natureOfTour", "bestSeason", "activityPerDay", "transportation"];

        for (const key of possiblefield) {
            if (req.body[key]) {
                updatedData[key] = req.body[key];
            }
        }

        if (req.body["discount"]) {
            const price = parseFloat(req.body["originalPrice"]);
            const discount = parseFloat(req.body["discount"]);
            if (Number.isNaN(price) || Number.isNaN(discount)) {
                return next(new errorHandler("Price or Discount must be numbers.", 400));
            }
            updatedData["discountedPrice"] = price - (price * (discount / 100));
            updatedData["discount"] = req.body["discount"];
        }

        if (req.body.tourName) {
            updatedData["slug"] = slugify(req.body.tourName);
        }

        const updatedTour = await Tour.findByIdAndUpdate(id, updatedData, { new: true });
        if (!updatedTour) return next(new errorHandler("Failed to update tour.", 500));

        successMessage(res, `Tour updated successfully.`, 200);
    } catch (error) {
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
            } catch (cloudinaryError) {
                console.error("Failed to delete newly uploaded thumbnail after error:", cloudinaryError.message);
            }
        }

        return next(new errorHandler(error.message || "Something went wrong", 500));
    }
}


module.exports.updateTourDescription = async (req, res, next) => {
    try {
        await databaseConnect()

        // id from url
        let { tourId } = req.params;
        if (!tourId) return next(new errorHandler("No tour id is given.Please try again.", 400));
        const possiblefield = ["tourId", "shortDescription", "detailedDescription", "highlights"];
        let updatedData = {};


        for (key of Object.keys(req.body)) {
            if (possiblefield.includes(key)) {
                updatedData[key] = req.body[key];
            }
        }

        // querying to database
        const updateTour = await Description.findOneAndUpdate({ "tourId": tourId }, updatedData);
        // console.log(updateTour)
        if (!updateTour || Object.keys(updateTour).length === 0) {

            return next(new errorHandler("Cannot update Details of tour . Please try again later.", 500));
        }



        // sending response
        res.status(200).json({
            status: true,
            message: "Details Updated sucessfully"
        });
    } catch (error) {
        next(new errorHandler(error.message || "Something went wrong.Please try again.", 500));
    }
};

// @method DELETE
// @desc: Controller to delete a tour
// @endpoint: localhost:6000/tour-admin/delete-tour/:id
module.exports.deleteTour = async (req, res, next) => {
    try {
        await databaseConnect();

        const { id } = req.params;
        if (!id) return next(new errorHandler("No tour id is given. Please try again.", 400));

        const deleted = await Tour.findByIdAndDelete(id);
        if (!deleted) return next(new errorHandler("Tour not found or already deleted.", 404));

        res.status(200).json({
            status: true,
            message: "Tour deleted successfully"
        });
    } catch (error) {
        next(new errorHandler(error.message || "Something went wrong while deleting the tour.", 500));
    }
};



// @method POST
// @desc:controller to send a enquiry message to owner 
// @endpoint:localhost:6000/api/ask-question

module.exports.enquiry = async (req, res, next) => {
    try {
        await databaseConnect()

        // destructring name,email,contact,message from req.body
        const tourId = req.query.tourId
        if (!req.body) return next(new errorHandler(`fullName,startDate,email,country,contact,question field are missing.`, 400));
        if (!tourId) return next(new errorHandler("The tour id is missing.", 400));
        let response
        let tour

        response = await Tour.findById(tourId);
        if (!response) return next(new errorHandler("No tour is found from given id.", 404));
        tour = response
        delete tour._id;
        delete tour.__v;
        delete tour.slug

        const possiblefield = ["fullName", "startDate", "email", "country", "contact", "question"]
        const check = possiblefield.filter(key => !Object.keys(req.body).includes(key) || !req.body[key] || req.body[key].toString().trim() === "")
        // if field is missing 
        if (check.length !== 0) return next(new errorHandler(`${check.join(",")} ${check.length > 1 ? "fields are" : "field is"} missing.`));
        // check email if it is valid or not
        if (!validateEmail(req.body["email"])) return next(new errorHandler("Email address is not valid.Please try again.", 400));
        // check phone number if it is valid or not
        if (!isValidNepaliPhoneNumber(req.body["contact"])) return next(new errorHandler("Please enter valid phone number.", 400));

        // concat the first name and last name
        const name = capaitlize(req.body["fullName"])
        // create message template form enquiryMessage Function
        const createMessage = enquiryMessage(name, req.body["email"], req.body["contact"], req.body["startDate"], req.body["question"], req.body["country"], tour);
        // Send message
        await sendMessage(res, process.env.NODEMAILER_USER, "Enquiry message", createMessage);//NOTE: ENTER THE REAL COMPANY EMAIL INSTEAD OF NODEMAILER USER.
        // send sucess response
        successMessage(res, "Your question is sent. Please wait for the reply.", 200);

    } catch (error) {
        return next(new errorHandler(error.message, error.statusCode || 500));
    }
}


// @method POST
// @desc:controller to send a message to owner if customer books the tour
// @endpoint:localhost:6000/api/book-tour?tourName=*********
module.exports.bookTour = async (req, res, next) => {
    try {



        const { tourName } = req.query;
        if (!tourName) return next(new errorHandler("No name of tour is given on the query.Please try again", 400));
        if (!req.body) return next(new errorHandler("Please provide body field to proceed further.", 400));
        let response
        try {
            await databaseConnect()
            response = await Tour.findOne({ slug: tourName });
            if (!response || Object.keys(response).length === 0) return next(new errorHandler("No tour found.", 404));

        } catch (error) {
            console.error('DB Error:', error);
            return next(new errorHandler("Database connection error.", 500));
        }
        const possiblefield = ["startingDate", "endingDate", "fullName", "email", "country", "contactNumber", "emergencyContact", "NumberofParticipants", "advancePayment", "payLater"];
        const check = possiblefield.filter(key => !Object.keys(req.body).includes(key) || !req.body[key] || req.body[key].toString().trim() === "");
        if (check.length !== 0) return next(new errorHandler(`${check.join(",")} ${check.length > 1 ? "fields are missing" : "field is missing"}.`, 400));
        if (req.body["contactNumber"] === req.body["emergencyContact"]) return next(new errorHandler("Phone no must be different.Please try again.", 400));
        // if(isValidNepaliPhoneNumber(req.body["contactNumber"]))return next(new errorHandler("Phone no is not valid.Please try again.", 400));
        if (!validateEmail(req.body["email"])) return next(new errorHandler("Email address is not valid.Please try again.", 400));
        let data = {};
        for (const key of possiblefield) {
            if (key === "fullName") req.body[key] = capaitlize(req.body[key]);
            data[key] = req.body[key]
        }
        const optionalFields = ["flightArrivalDate", "flightDepartureDate", "otherInformation"];

        for (const key of optionalFields) {
            if (req.body[key] && req.body[key].toString().trim() !== "") {
                data[key] = req.body[key];
            }
        }
        req.session.bookingData = data
        req.session.tourData = response;
        res.status(200).json({
            message: "Your booking details.",
            status: true,
            tourDetails: response,
            data,
            paymentUrl: process.env.BASE_URL
        });

    } catch (error) {
        return next(new errorHandler(error.message, error.statusCode || 500));
    }
}



// exports.uploadTourImages = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         if (!id) return next(new errorHandler("Please provide id of tour.", 400));


//         const tour = await Tour.findById(id);
//         if (!tour) return next(new errorHandler("Tour not found", 404));

//         if (!req.files || req.files.length === 0) {
//             return next(new errorHandler("Please upload more than one", 400));
//         }

//         const uploadedImages = req.files.map(file => ({
//             url: file.path,
//             public_id: file.filename,
//         }));

//         tour.images.push(...uploadedImages); // append to existing images
//         await tour.save();

//         res.status(200).json({
//             message: "Images uploaded successfully",
//             images: tour.images,
//         });
//     } catch (error) {
//         console.error(error);
//         next(new errorHandler(error.message || "Failed to upload images", 500));
//     }
// };
