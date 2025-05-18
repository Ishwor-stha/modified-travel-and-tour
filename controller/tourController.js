const Tour = require("../modles/tourModel");
// const { deleteImage } = require("../utils/deleteImage");
const errorHandler = require("../utils/errorHandling");
// const fs = require("fs");
// const path = require("path");
const { validateEmail } = require("../utils/emailValidation");
const { bookMessage } = require("../utils/bookingMessage");
const { isValidNepaliPhoneNumber } = require("../utils/validatePhoneNumber");
// const sendMessage = require("../utils/sendMessage");
const {sendMessage}=require("../utils/nodemailer");
const { isValidNumber } = require("../utils/isValidNumber");
const { enquiryMessage } = require("../utils/enquiryMessage");
const {successMessage} = require("../utils/sucessMessage");


//@method :GET 
//@Endpoint: localhost:6000/get-tours
//@desc:Getting the array of tours in object
module.exports.getTours = async (req, res, next) => {
    try {
        // variable for sorting
        let sort;

        // let query={}
        let condition = [];
        let fields = ["placeName", "active_month", "destination", "category", "tour_type", "duration", "name", "country", "district", "pickup_destination"];

        // destructuring query parameters
        let { page = 1 } = req.query;

        // Handling the sorting logic
        if (req.query.adult_price || req.query.youth_price || req.query.popularity) {
            const { adult_price, youth_price, popularity } = req.query;
            if (adult_price) sort = adult_price === "asc" ? 1 : -1;
            if (youth_price) sort = youth_price === "asc" ? 1 : -1;
            if (popularity) sort = popularity === "asc" ? 1 : -1;

        }
        // iterate through query
        for (let keys in req.query) {
            if (fields.includes(keys)) {
                if (keys === "active_month") {

                    // new RegExp("pattern",flags) object is used to make a data case insensitive "i" stands for insensitive  
                    condition.push({ active_month: { $in: [req.query[keys]] } });//i.e{ destination: /mustang/i }
                }
                else {
                    condition.push({ [keys]: new RegExp(req.query[keys], "i") });
                }
            }
        }
        

     

        // Fetching the data from the database using $or condition for flexible matching
        let tourQuery = Tour.find();
        // console.log(condition)

        if (condition.length > 0) {
            // Use $or if any of the conditions are provided
            tourQuery = tourQuery.where({ $or: condition });
        }

        // If sorting by price 
        if (req.query.adult_price || req.query.youth_price || req.query.popularity) {
            if (req.query.popularity) tourQuery = tourQuery.sort({ popularity: sort });
            if (req.query.adult_price) tourQuery = tourQuery.sort({ adult_price: sort });
            if (req.query.youth_price) tourQuery = tourQuery.sort({ youth_price: sort });

        }

        //pagination logic
        //string to integer
        page = parseInt(page);
        // page is <0 then set to 1 otherwise set page to roundup value of page
        page = (page > 0) ? Math.ceil(page) : 1;
        const limit = 10;
        const skip = (page - 1) * limit; // Skip results based on current page
        const tour = await tourQuery.skip(skip).limit(limit);
        // if there is is tour 
        if (!tour || Object.keys(tour).length === 0) return next(new errorHandler("No tour found in the database.", 404));

        res.status(200).json({
            pageNo: page,
            totalTours:tour.length,
            status: true,
            tourList: tour
        });

    } catch (error) {
        // passing erorr to the error handling middleware
        next(new errorHandler(error.message, error.statusCode || 500));

    }
};

//@method :GET 
//@Endpoint: localhost:6000/get-one-tour/:slug
//@desc:Getting the detail of  tour 
module.exports.getOneTour = async (req, res, next) => {
    try {
        const { slug } = req.params;
        if (!slug) return next(new errorHandler("No slug given of tour.Please try again.", 400));
        const tour = await Tour.findOne({ slug: slug }, "");
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
       const possiblefield=["tourName","country","price","accomodation","region","distance","startPoint","endPoint",
        "duration","maxAltitude","mealsIncluded","groupSize","natureOfTour","bestSeason","activityPerDAy","transportation"];
        const check=possiblefield.filter(key=> !Object.keys(req.body).includes(key) || !req.body[key] || req.body[key].toString().trim()=== "");
        if(check.length !==0)return next(new errorHandler(`${check.join(",")} ${check.length>1?"field is":"fields are"} missing.`));
        let data={}
        for(key in possiblefield){
            data[key]=req.body[key];
        }
        const create=await Tour.create(data);
        if(!create)return next(new errorHandler("Cannot create the tour.Please try again later",500));
        successMessage(res,`${req.body[tourName]} created sucessfully.`,200);

    } catch (error) {
        // Delete uploaded files immediately on error
        // if (req.files) {
        //     const uploadedFilePaths = req.files.map(file => file.path);
        //     deleteImage(uploadedFilePaths);
        // }
        if (error.code === 11000 || error.code === "E11000") {
            return next(new errorHandler("Tour name already exists", 400));
        }
        return next(new errorHandler(error.message, error.statusCode || 500));
    }
};


// @method PATCH
// @desc:A controller to update the existing data of data base
// @endpoint:localhost:6000/tour-admin/update-tour/:id
module.exports.updateTour = async (req, res, next) => {
    try {
        // id from url
        let id = req.params.id;
        if (!id) return next(new errorHandler("No tour id is given.Please try again.", 400));
        const keys = ["name", "drop_destination", "pickup_destination", "country", "adult_price", "youth_price", "description", "destination", /*"image",*/ "district", "category", "tour_type", "duration", "discount", "placeName", "active_month", "popularity", "minimumGuest"];

        let updatedData = {};

        // check whether the req.body has valid key
        for (let key in req.body) {
            if (keys.includes(key)) {
                updatedData[key] = req.body[key];
            }
        }

        if (req.body.discount !== undefined &&  !isValidNumber(req.body.discount)) {
            throw new Error("Please enter valid discount number");//straight to the catch block

        }
        // let oldPhoto;
        // if (req.files) {
        //     updatedData.image = req.files.map(file => file.path); // Update image if new file is uploaded
        //     oldPhoto = await Tour.findById(id, "image");

        // }



        // querying to database
        const updateTour = await Tour.findByIdAndUpdate(id, updatedData, { new: true });
        // console.log(updateTour)
        if (!updateTour || Object.keys(updateTour).length === 0) {
            // if (req.files) {
            //     deleteImage(updatedData.image);
            // }
            return next(new errorHandler("Cannot update tour. Please try again later.", 500));
        }

        // Delete old image if a new one was uploaded
        // if (req.files && oldPhoto) {
        //     deleteImage(oldPhoto.image);

        // }

        // sending response
        res.status(200).json({
            status: true,
            name: updateTour.name,
            updatedData
        });
    } catch (error) {
        // if (req.files) {
        //     const uploadedFilePaths = req.files.map(file => file.path);
        //     deleteImage(uploadedFilePaths);
        // }
        next(new errorHandler(error.message || "Something went wrong.Please try again.", 500));
    }
};

// @method DELETE
// @desc:controller to delete tour
// @endpoint:localhost:6000/tour-admin/delete-tour/:id
module.exports.deleteTour = async (req, res, next) => {
    try {
        // id from url
        const id = req.params.id;
        if (!id) return next(new errorHandler("Tour id is missing.Please try again. ", 400));
        // querying the database
        const del = await Tour.findByIdAndDelete(id);
        if (!del || Object.keys(del).length <= 0) return next(new errorHandler("No Tour found.Please try again.", 404));
        // sending response
        res.status(200).json({
            status: true,
            message: `${del.name} deleted .`

        });
    } catch (error) {
        // passing error to the error handling middleware
        next(new errorHandler(error.message, error.statusCode || 500));


    }
}


// @method POST
// @desc:controller to send a message to owner if customer books the tour
// @endpoint:localhost:6000/api/book-tour?tourName=*********
module.exports.bookTour = async (req, res, next) => {
    try {

        const { tourName } = req.query;
        if (!tourName) return next(new errorHandler("No name of tour is given on the query.Please try again", 400));
        // destructring objects form req.body

        const { firstName, lastName, date, phone, secondPhone, email, time, age } = req.body;
        // if data is missing
        if (!firstName || !lastName || !date || !phone || !email || !time || !age || !tourName ||!secondPhone) return next(new errorHandler("All fields are required.Please fill the form again.", 400));
        const name = `${firstName} ${lastName}`;
        // email validation falils
        if (!validateEmail(email)) return next(new errorHandler("Email address is not valid.Please try again.", 400));
        //phone number validation fails
        if (!isValidNepaliPhoneNumber(phone)) return next(new errorHandler("Please enter valid phone number.", 400));
        if (!isValidNepaliPhoneNumber(secondPhone)) return next(new errorHandler("Please enter valid phone number.", 400));
        if(phone===secondPhone)return next(new errorHandler("Phone number must be different in both field.",400));
        const userDate=new Date(date)
        const currentDate=new Date()
        if(userDate<currentDate) return next(new errorHandler("Invalid booking date. Please select a future date.", 400));
        // create message 
        const message = bookMessage(name, tourName, date, phone,secondPhone, email, time, age);
       
        // send message to the email
        await sendMessage(res,process.env.personal_message_gmail,"Tour Booking Alert",message);
        // await sendMessage(next, message, "Tour booking alert", process.env.personal_message_gmail, "Astrapi Travel");
        // send response
        successMessage(res, "Thank you for your booking! A confirmation email has been sent to Astrapi Travel and Tour", 200);

    } catch (error) {
        return next(new errorHandler(error.message, error.statusCode || 500));
    }
}



// @method POST
// @desc:controller to send a enquiry message to owner 
// @endpoint:localhost:6000/api/ask-question
// "contact2":"984555555",
module.exports.enquiry = async (req, res, next) => {
    try {
        // destructring name,email,contact,message from req.body
        const { firstName, lastName, email, contact,contact2, question } = req.body;
        // if field is missing 
        if (!firstName || !lastName || !email || !contact || !question || !contact2) return next(new errorHandler("Some field is missing.Please fill up all the form.", 400));
        // check email if it is valid or not
        if (!validateEmail(email)) return next(new errorHandler("Email address is not valid.Please try again.", 400));
        // check phone number if it is valid or not
        if (!isValidNepaliPhoneNumber(contact)) return next(new errorHandler("Please enter valid phone number.", 400));
        if (!isValidNepaliPhoneNumber(contact2)) return next(new errorHandler("Please enter valid phone number.", 400));
        if(contact===contact2)return next(new errorHandler("The phone number must be different in both field.",400));

        // concat the first name and last name
        const name =` ${firstName } ${lastName}`;
        // create message template form enquiryMessage Function
        const createMessage = enquiryMessage(name, email, contact,contact2, question);
        // Send message
        
        await sendMessage(res,process.env.NODEMAILER_USER,"Enquiry message",createMessage);//NOTE: ENTER THE REAL COMPANY EMAIL INSTEAD OF NODEMAILER USER.
        // await sendMessage(next, createMessage, "Enquiry message", email, name);
        // send sucess response
        successMessage(res, "Your question is sent. Please wait for the reply.",200);
       
    } catch (error) {
        return next(new errorHandler(error.message, error.statusCode || 500));
    }
}