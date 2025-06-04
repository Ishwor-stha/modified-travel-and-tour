const Tour = require("../modles/tourModel");
const errorHandler = require("../utils/errorHandling");
const { validateEmail } = require("../utils/emailValidation");
const { isValidNepaliPhoneNumber } = require("../utils/validatePhoneNumber");
const { sendMessage } = require("../utils/nodemailer");
const { enquiryMessage } = require("../utils/enquiryMessage");
const { successMessage } = require("../utils/sucessMessage");
const slugify = require("slugify");
const { capaitlize } = require("../utils/capitalizedFirstLetter");
const Description = require("../modles/descriptionModel")
const { databaseConnect } = require("../utils/databaseConnect")
const { cloudinary } = require("../utils/clouudinary");
const { isValidNumber } = require("../utils/isValidNumber");


// Helper function for checking missing fields
const checkMissingFields = (body, fields) => {
    const missing = fields.filter(key => !Object.keys(body).includes(key) || !body[key] || String(body[key]).trim() === "");
    if (missing.length > 0) {
        return `${missing.join(", ")} ${missing.length > 1 ? "fields are" : "field is"} missing.`;
    }
    return null;
};

//getTours
const TOUR_FILTER_FIELDS = ["country", "activity", "grade"];
//postTour /updateTour
const TOUR_POST_FIELDS = ["tourName", "country", "grade", "activity", "originalPrice", "accomodation", "region", "distance", "startPoint", "discount", "endPoint",
    "duration", "maxAltitude", "mealsIncluded", "groupSize", "natureOfTour", "bestSeason", "activityPerDay", "transportation"];
//createDescriptionOfTour /updateTourDescription
const DESCRIPTION_FIELDS = ["tourId", "shortDescription", "detailedDescription", "highlights"];
//enquiry
const ENQUIRY_FIELDS = ["fullName", "startDate", "email", "country", "contact", "question"];
//bookTour
const BOOKING_FIELDS = ["startingDate", "endingDate", "fullName", "email", "country", "contactNumber", "emergencyContact", "NumberofParticipants", "advancePayment", "payLater"];
//bookTour
const OPTIONAL_BOOKING_FIELDS = ["flightArrivalDate", "flightDepartureDate", "otherInformation"];

// Helper function for calculating discounted price
const calculateDiscountedPrice = (originalPrice, discount) => {
 
    const price = parseFloat(originalPrice);
    const disc = parseFloat(discount);
    if (Number.isNaN(price) || Number.isNaN(disc)) {
        return { error: "Price or Discount must be numbers." };
    }
    if(isValidNumber(discount )) return {error:"The discount must be in between 0-100."};
    return { discountedPrice: price - (price * (disc / 100)) };
};


// @method GET
// @desc: Getting the array of tours
// @endpoint: localhost:6000/api/get-tours
module.exports.getTours = async (req, res, next) => {
    try {
        await databaseConnect();
        const { page = 1, originalPrice, popularity } = req.query;
        let sort = {};

        // Sorting logic
        if (originalPrice) {
            sort.originalPrice = originalPrice === "asc" ? 1 : -1;
        }
        if (popularity) {
            sort.popularity = popularity === "asc" ? 1 : -1;
        }

        // Filter logic
        const conditions = TOUR_FILTER_FIELDS.reduce((acc, field) => {
            if (req.query[field]) {
                acc.push({ [field]: new RegExp(req.query[field], "i") });
            }
            return acc;
        }, []);

        // Build base query
        const query = conditions.length > 0 ? { $or: conditions } : {};

        // Pagination
        const parsedPage = parseInt(page);
        const currentPage = parsedPage > 0 ? parsedPage : 1;
        const limit = 10;
        const skip = (currentPage - 1) * limit;

        // Count total results (for pagination info)
        const totalTours = await Tour.countDocuments(query);

        // Build and execute query
        let toursQuery = Tour.find(query, "-popularity").skip(skip).limit(limit);
        if (Object.keys(sort).length > 0) {
            toursQuery = toursQuery.sort(sort);
        }
        const tourList = await toursQuery;

        // If no results
        if (!tourList || tourList.length === 0) {
            return next(new errorHandler("No tour found in the database.", 404));
        }

        // Respond
        res.status(200).json({
            pageNo: currentPage,
            totalTours,
            status: true,
            tourList,
        });
    } catch (error) {
        return next(new errorHandler(error.message || "Something went wrong", error.statusCode || 500));
    }
};

// @method GET
// @desc: Getting one tour description by tour ID
// @endpoint: localhost:6000/api/get-description/:tourId
module.exports.getOneTourDescriptionId = async (req, res, next) => {
    try {
        await databaseConnect();

        const { tourId } = req.params;
        if (!tourId) return next(new errorHandler("No id given of tour.Please try again.", 400));
        const tourDescription = await Description.findOne({ "tourId": tourId });
        if (!tourDescription) return next(new errorHandler("No tour description found.Please try again.", 404));
        res.status(200).json({
            status: true,
            tourDescription
        });

    } catch (error) {
        return next(new errorHandler(error.message, error.statusCode || 500));
    }
}

// @method GET
// @desc: Getting one tour by ID
// @endpoint: localhost:6000/api/get-tour/:id
module.exports.getOneTourById = async (req, res, next) => {
    try {
        await databaseConnect();

        const { id } = req.params;
        if (!id) return next(new errorHandler("No id given of tour.Please try again.", 400));
        const tour = await Tour.findById(id, "-popularity");
        if (!tour) return next(new errorHandler("No tour found.Please try again.", 404));
        res.status(200).json({
            status: true,
            tour
        });

    } catch (error) {
        return next(new errorHandler(error.message, error.statusCode || 500));
    }
}

// @method GET
// @desc: Getting the detail of a tour by slug
// @endpoint: localhost:6000/api/get-tour-by-slug/:slug
module.exports.getOneTour = async (req, res, next) => {
    try {
        await databaseConnect();

        const { slug } = req.params;
        if (!slug) return next(new errorHandler("No slug given of tour.Please try again.", 400));
        const tour = await Tour.findOne({ slug: slug }, "-popularity");
        if (!tour) return next(new errorHandler("No tour found.Please try again.", 404));
        res.status(200).json({
            status: true,
            tour
        });

    } catch (error) {
        return next(new errorHandler(error.message, error.statusCode || 500));
    }
}

// @method POST
// @desc: Controller to add new tours
// @endpoint: localhost:6000/api/tour-admin/post-tour
module.exports.postTour = async (req, res, next) => {
    try {
        await databaseConnect();

        const missingFieldsError = checkMissingFields(req.body, TOUR_POST_FIELDS);
        if (missingFieldsError) return next(new errorHandler(missingFieldsError, 400));

        if (!req.file || req.file.fieldname !== "thumbnail") return next(new errorHandler("The thumbnail of the image is missing", 400));

        const checkTour = await Tour.findOne({ tourName: req.body.tourName }).select("tourName");
        if (checkTour) return next(new errorHandler("The tour with this name already exists.", 400));

        let data = {};
        data.thumbnail = {
            url: req.file.path,
            public_id: req.file.filename
        };

        for (const key of TOUR_POST_FIELDS) {
            data[key] = req.body[key];
        }

        if (req.body.discount) {
            const price = parseFloat(req.body.originalPrice);
            const discount = parseFloat(req.body.discount);
            if (Number.isNaN(price) || Number.isNaN(discount)) {
                return next(new errorHandler("Price or Discount must be numbers.", 400));
            }
            if(isValidNumber(discount )) return next(new errorHandler("The discount must be in between 0-100.", 400));
            data.discountedPrice = price - (price * (discount / 100));
            data.discount = req.body.discount;
        }
        if (req.body.popularity) data.popularity = req.body.popularity;
        data.slug = slugify(req.body.tourName);

        const create = await Tour.create(data);
        if (!create) return next(new errorHandler("Cannot create the tour.Please try again later", 500));
        successMessage(res, `${req.body.tourName} created successfully.`, 200);

    } catch (error) {
        if (error.code === 11000 || error.code === "E11000") {
            return next(new errorHandler("The tour with this name already exists.", 400));
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

// @method POST
// @desc: Controller to create description of a tour
// @endpoint: localhost:6000/api/create-description/:tourId
module.exports.createDescriptionOfTour = async (req, res, next) => {
    try {
        await databaseConnect();

        const { tourId } = req.params;
        if (!tourId) return next(new errorHandler("Tour id is not given.Please provide tour id.", 400));

        req.body.tourId = tourId; // Ensure tourId is in body for validation
        const missingFieldsError = checkMissingFields(req.body, DESCRIPTION_FIELDS);
        if (missingFieldsError) return next(new errorHandler(missingFieldsError, 400));

        let data = {};
        for (const key of DESCRIPTION_FIELDS) {
            data[key] = req.body[key];
        }
        const create = await Description.create(data);
        if (!create) return next(new errorHandler("Cannot create the description of tour.Please try again later", 500));
        successMessage(res, `Description created successfully.`, 200);

    } catch (error) {
        if (error.code === 11000 || error.code === "E11000") {
            return next(new errorHandler("The tour description of this tour already exists.", 400));
        }
        return next(new errorHandler(error.message, error.statusCode || 500));
    }
};

// @method PATCH
// @desc: Controller to update existing tour data
// @endpoint: localhost:6000/api/tour-admin/update-tour/:id
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
        for (const key of TOUR_POST_FIELDS) { // Use constant
            if (req.body[key] !== undefined) { // Check for existence, not just truthiness
                updatedData[key] = req.body[key];
            }
        }

        if (req.body.discount) {
            const { discountedPrice, error } = calculateDiscountedPrice(req.body.originalPrice, req.body.discount);
            if (error) return next(new errorHandler(error, 400));
            updatedData.discountedPrice = discountedPrice;
            updatedData.discount = req.body.discount;
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


// @method PATCH
// @desc: Controller to update tour description
// @endpoint: localhost:6000/api/update-description/:tourId
module.exports.updateTourDescription = async (req, res, next) => {
    try {
        await databaseConnect();

        // id from url
        const { tourId } = req.params;
        if (!tourId) return next(new errorHandler("No tour id is given.Please try again.", 400));

        const updatedData = {};
        for (const key of DESCRIPTION_FIELDS) { // Using the constant array
            if (req.body[key] !== undefined && String(req.body[key]).trim() !== "") {
                updatedData[key] = req.body[key];
            }
        }

        if (Object.keys(updatedData).length === 0) {
            return next(new errorHandler("No valid fields provided for update.", 400));
        }

        // querying to database
        const updateTour = await Description.findOneAndUpdate({ "tourId": tourId }, updatedData, { new: true });
        if (!updateTour) {
            return next(new errorHandler("Cannot update Details of tour. Tour description not found or failed to update.", 404));
        }

        // sending response
        successMessage(res, "Details Updated successfully", 200);
    } catch (error) {
        return next(new errorHandler(error.message || "Something went wrong.Please try again.", 500));
    }
};

// @method DELETE
// @desc: Controller to delete a tour
// @endpoint: localhost:6000/api/tour-admin/delete-tour/:id
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
// @desc: Controller to send an enquiry message to owner
// @endpoint: localhost:6000/api/enquiry
module.exports.enquiry = async (req, res, next) => {
    try {
        await databaseConnect();

        const { tourId } = req.query;
        if (!tourId) return next(new errorHandler("The tour id is missing.", 400));

        const tour = await Tour.findById(tourId).lean(); // Use .lean() to get a plain JavaScript object
        if (!tour) return next(new errorHandler("No tour is found from given id.", 404));

        const missingFieldsError = checkMissingFields(req.body, ENQUIRY_FIELDS);
        if (missingFieldsError) return next(new errorHandler(missingFieldsError, 400));

        if (!validateEmail(req.body.email)) return next(new errorHandler("Email address is not valid.Please try again.", 400));
        if (!isValidNepaliPhoneNumber(req.body.contact)) return next(new errorHandler("Please enter valid phone number.", 400));

        const name = capaitlize(req.body.fullName);
        const createMessage = enquiryMessage(name, req.body.email, req.body.contact, req.body.startDate, req.body.question, req.body.country, tour);

        await sendMessage(res, process.env.NODEMAILER_USER, "Enquiry message", createMessage);
        successMessage(res, "Your question is sent. Please wait for the reply.", 200);

    } catch (error) {
        return next(new errorHandler(error.message, error.statusCode || 500));
    }
}

// @method POST
// @desc: Controller to send a message to owner if customer books the tour
// @endpoint: localhost:6000/api/first-book-tour
module.exports.bookTour = async (req, res, next) => {
    try {
        await databaseConnect();

        const { tourName } = req.query;
        if (!tourName) return next(new errorHandler("No name of tour is given on the query.Please try again", 400));

        const tour = await Tour.findOne({ slug: tourName }).lean();
        if (!tour) return next(new errorHandler("No tour found.", 404));

        const missingFieldsError = checkMissingFields(req.body, BOOKING_FIELDS);
        if (missingFieldsError) return next(new errorHandler(missingFieldsError, 400));

        if (req.body.contactNumber === req.body.emergencyContact) return next(new errorHandler("Phone no must be different.Please try again.", 400));
        if (!validateEmail(req.body.email)) return next(new errorHandler("Email address is not valid.Please try again.", 400));
        // if (!isValidNepaliPhoneNumber(req.body.contactNumber)) return next(new errorHandler("Phone no is not valid.Please try again.", 400)); // Uncomment if needed

        let data = {};
        for (const key of BOOKING_FIELDS) {
            data[key] = key === "fullName" ? capaitlize(req.body[key]) : req.body[key];
        }

        for (const key of OPTIONAL_BOOKING_FIELDS) {
            if (req.body[key] && String(req.body[key]).trim() !== "") {
                data[key] = req.body[key];
            }
        }

        req.session.bookingData = data;
        req.session.tourData = tour; // Store the lean object

        res.status(200).json({
            message: "Your booking details.",
            status: true,
            tourDetails: tour,
            data,
            paymentUrl: process.env.BASE_URL
        });

    } catch (error) {
        return next(new errorHandler(error.message, error.statusCode || 500));
    }
}

// @method POST
// @desc: Controller to upload images for a tour
// @endpoint: localhost:6000/api/tours/:id/images
module.exports.uploadImageForTour = async (req, res, next) => {
    try {
        await databaseConnect();

        const { id } = req.params;
        if (!id) {
            return next(new errorHandler("Tour ID is missing. Please provide a tour ID.", 400));
        }

        if (!req.files || req.files.length === 0) {
            return next(new errorHandler("No images uploaded. Please upload at least one image.", 400));
        }

        if (req.files.length > 10) {
            return next(new errorHandler("You can upload a maximum of 10 images.", 400));
        }

        const tour = await Tour.findById(id);
        if (!tour) {
            return next(new errorHandler("Tour not found.", 404));
        }

        // Map uploaded files to the schema format
        const newImages = req.files.map(file => ({
            url: file.path,
            public_id: file.filename
        }));

        // Add new images to the existing images array
        tour.images.push(...newImages);

        // Save the updated tour
        await tour.save();

        successMessage(res, "Images uploaded successfully.", 200);
    } catch (error) {
        return next(new errorHandler(error.message || "Something went wrong while uploading images.", 500));
    }

}


// @method DELETE
// @desc: Controller to delete one image of a tour
// @endpoint: localhost:6000/api/delete/:tourId/images/:publicId
module.exports.deleteOneImageOfTour = async (req, res, next) => {
    try {

        await databaseConnect();

        const { tourId, publicId } = req.params
        if (!tourId || !publicId) return next(new errorHandler("Tour id or Public id is not passed through params.Please check and request again", 400));
        const tour = await Tour.findById(tourId);
        if (!tour) return next(new errorHandler("Cannot find the tour from given id.", 404));
        const imageIndex = tour.images.findIndex(img => img.public_id === publicId);
        if (imageIndex === -1) {
            return next(new errorHandler("Image not found in this tour.", 404));
        }

        await cloudinary.uploader.destroy(publicId);

        // Remove the image from the tour's images array
        tour.images.splice(imageIndex, 1);

        // Save the updated tour document
        await tour.save();

        successMessage(res, "Image deleted successfully.", 200);

    } catch (error) {
        return next(new errorHandler(error.message || "Something went wrong while deleting the image.", 500));
    }
}
