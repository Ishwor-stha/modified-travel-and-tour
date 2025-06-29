const errorHandler = require("../utils/errorHandling");
const { sendMessage } = require("../utils/nodemailer");
const axios = require("axios");
const crypto = require("crypto");
const { bookingMessageUser } = require("../utils/bookingMessageUser");
const { bookingMessageAdmin } = require("../utils/bookingMessageAdmin");
const path = require("path");
const Booking = require("../modles/bookingModel"); // Import the new Booking model
const Tour = require("../modles/tourModel"); // Assuming you need Tour model to populate tourData


// @method POST
// @desc: Controller to initiate payment with Esewa
// @endpoint: localhost:6000/api/tour/pay-with-esewa
module.exports.payWithEsewa = async (req, res, next) => {
    try {
        const bookingData = req.session.bookingData;
        const tourData = req.session.tourData;
        // console.log("Session data before redirect (payWithEsewa):", bookingData); // Removed log

        const amount = bookingData["advancePayment"];
        const tax_amount = 0, product_service_charge = 0, product_delivery_charge = 0;

        if (!amount) return next(new errorHandler("No amount is given.", 400));
        if (amount <= 0) return errorHandler("Amount must be above 0.", 400);
        const total_amount = parseFloat(amount) + parseFloat(tax_amount) + parseFloat(product_service_charge) + parseFloat(product_delivery_charge);
        
        const transaction_uuid = Date.now();
        const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${process.env.PRODUCT_CODE}`;
        const signature = crypto.createHmac('sha256', process.env.SECRET_KEY).update(message).digest('base64');
        const paymentData = {
            amount: parseFloat(amount),
            tax_amount: parseFloat(tax_amount),
            total_amount: parseFloat(total_amount),
            product_service_charge: parseFloat(product_service_charge),
            product_delivery_charge: parseFloat(product_delivery_charge),
            transaction_uuid,
            product_code: process.env.PRODUCT_CODE,
            success_url: `${process.env.SUCCESS_URL}/${transaction_uuid}/payment-success`,
            failure_url: process.env.FAILURE_URL,
            signed_field_names: 'total_amount,transaction_uuid,product_code',
            signature: signature,
        };

        const pay = await axios.post(process.env.BASE_URL, new URLSearchParams(paymentData).toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        // Save booking data to the database
        const newBooking = await Booking.create({
            bookingData: bookingData,
            tourId: tourData._id, // Assuming tourData contains _id
            transaction_uuid: transaction_uuid
        });

        // console.log(pay.request.res.responseUrl)
        // res.redirect(pay.request.res.responseUrl)
        
        res.status(200).json({
            url:pay.request.res.responseUrl
        })

    } catch (error) {
        return next(new errorHandler(error.message, error.statusCode || 500));
    }
}


// @method GET
// @desc: Controller for successful payment callback
// @endpoint: localhost:6000/api/tour/payment-success
module.exports.paymentSucess = async (req, res, next) => {
    try {
        

        if (!req.query.data) return next(new errorHandler("Server error", 400))
        let transactionId = req.params.transactionId
        if (!transactionId) return next(new errorHandler("Cannot get transaction id", 400))
        transactionId = Number(transactionId)
        const encodedData = req.query.data;
        const decodedData = JSON.parse(Buffer.from(encodedData, "base64").toString("utf-8"));

        let TotalAmt = decodedData.total_amount.replace(/,/g, '')//removing the comma from the amount for hashing the message ie (5,000)=>(5000)
        TotalAmt = Number(TotalAmt); // Convert to a number

        TotalAmt = Number.isInteger(TotalAmt) ? TotalAmt.toFixed(0) : TotalAmt;
        const userSignature = `total_amount=${TotalAmt},transaction_uuid=${transactionId},product_code=${process.env.PRODUCT_CODE}`;
        const esewaSignature = `total_amount=${TotalAmt},transaction_uuid=${decodedData.transaction_uuid},product_code=${process.env.PRODUCT_CODE}`;

        const userHash = crypto.createHmac("sha256", process.env.SECRET_KEY).update(userSignature).digest("base64");
        const esewaHash = crypto.createHmac("sha256", process.env.SECRET_KEY).update(esewaSignature).digest("base64");

        if (userHash !== esewaHash) {
            return next(new errorHandler("Hash doesnot match.", 400))
        }


        const response = await axios.get(process.env.STATUS_CHECK, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            params: {
                product_code: process.env.PRODUCT_CODE,
                total_amount: TotalAmt,
                transaction_uuid: decodedData.transaction_uuid
            }
        });

        // Retrieve booking data from the database
        const booking = await Booking.findOne({ transaction_uuid: transactionId }).populate('tourId');

        if (!booking) {
            req.session.destroy();
            res.clearCookie('connect.sid');

            // Modified to send JSON response
            return res.status(400).json({
                status: "false",
                message: "User data or booking data is missing.",
                details: "Something went wrong.Please try again."
            });
        }

        const userData = booking.bookingData;
        const tourData = booking.tourId; 
        const htmlMessageUser = bookingMessageUser({
            userData,
            tourData,
            transaction_uuid: response.data.transaction_uuid,
            ref_id: response.data.ref_id,
            amount: response.data.total_amount,
            advancePayment: userData.advancePayment,
            laterPayment: userData.payLater,
            bookingDate: new Date().toLocaleDateString()
        });

        const htmlMessageAdmin = bookingMessageAdmin({
            userData,
            tourData,
            transaction_uuid: response.data.transaction_uuid,
            ref_id: response.data.ref_id,
            amount: response.data.total_amount,
            advancePayment: userData.advancePayment,
            laterPayment: userData.payLater,
            bookingDate: new Date().toLocaleDateString()
        });
        // message sent to user
        await sendMessage(res, userData.email, "Payment Details", htmlMessageUser);
        await sendMessage(res, process.env.NODEMAILER_USER, "Payment Details", htmlMessageAdmin);
        req.session.destroy();
        res.clearCookie('connect.sid');


        return res.sendFile(path.join(__dirname, '..', 'public', 'sucess.html'));

    } catch (error) {
        const transactionId=Number(req.params.transactionId)
        await Booking.findOneAndDelete({transaction_uuid:transactionId})
        req.session.destroy(); // Keep session destroy and cookie clear in error path
        res.clearCookie('connect.sid');
        return next(new errorHandler(error.message, error.statusCode || 500))
    }
}


// @method GET
// @desc: Controller for failed payment callback
// @endpoint: localhost:6000/api/tour/payment-failure
module.exports.paymentFailure = async (req, res, next) => {
    try {
        req.session.destroy();
        res.clearCookie('connect.sid');
        return res.sendFile(path.join(__dirname, '..', 'public', 'failure.html'));



    } catch (error) {
        return next(new errorHandler(error.message, error.statusCode || 500))

    }
}
