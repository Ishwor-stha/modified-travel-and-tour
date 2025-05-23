// const { deleteImage } = require("../utils/deleteImage");
const errorHandler = require("../utils/errorHandling");
// const fs = require("fs");
// const path = require("path");
const { sendMessage } = require("../utils/nodemailer");
const axios = require("axios");
const crypto = require("crypto");
const { bookingMessageUser } = require("../utils/bookingMessageUser");
const { bookingMessageAdmin } = require("../utils/bookingMessageAdmin");

module.exports.payWithEsewa = async (req, res, next) => {
    try {
        const bookingData = req.session.bookingData
        console.log(bookingData)
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
            success_url: process.env.SUCCESS_URL,
            failure_url: process.env.FAILURE_URL,
            signed_field_names: 'total_amount,transaction_uuid,product_code',
            signature: signature,
        };

        // console.log(paymentData);

        // console.log(process.env.BASE_URL)
        // const pay = await axios.post(process.env.BASE_URL, paymentData, {
        //     headers: {
        //         'Content-Type': 'application/json',
        //     }
        // });


        // // console.log(pay.request.res.responseUrl)
        // res.redirect(pay.request.res.responseUrl)
        res.status(200).json({
            status: true,
            paymentData
        })



    } catch (error) {
        return next(new errorHandler(error.message, error.statusCode || 500));
    }
}


// module.exports.paymentSucess = async (req, res, next) => {
//     try {
        

//         if (!req.query.data) return next(new errorHandler("Server error.",500))
//         const encodedData = req.query.data;

//         const decodedData = JSON.parse(Buffer.from(encodedData, "base64").toString("utf-8"));


//         const TotalAmt = decodedData["total_amount"].replace(/,/g, '')//removing the comma from the amount for hashing the message ie (5,000)=>(5000)
//         const message = `transaction_code=${decodedData.transaction_code},status=${decodedData.status},total_amount=${TotalAmt},
//         transaction_uuid=${decodedData.transaction_uuid},product_code=${process.env.PRODUCT_CODE},signed_field_names=${decodedData.signed_field_names}`;

//         const hash = crypto.createHmac("sha256", process.env.SECRET_KEY).update(message).digest("base64");

//         if (hash !== decodedData.signature) {
//             return res.json({
//                 data:req.query.data,
//                 decodedData,
                
//             })
//             return next(new errorHandler("Invalid signature.",  500))
//         }

//         const response = await axios.get(process.env.STATUS_CHECK, {
//             headers: {
//                 Accept: "application/json",
//                 "Content-Type": "application/json"
//             },
//             params: {
//                 product_code: process.env.PRODUCT_CODE,
//                 total_amount: TotalAmt,
//                 transaction_uuid: decodedData.transaction_uuid
//             }
//         });

//         const { status, transaction_uuid, total_amount } = response.data;
//         if (status !== "COMPLETE" || transaction_uuid !== decodedData.transaction_uuid || Number(total_amount) !== Number(TotalAmt)) {
//             return next(new errorHandler("Invalid transaction details", 500))

//         }
//         const userData= req.session.bookingData
//         const tourData= req.session.tourData
//         if(!userData || !tourData)return next(new errorHandler("User data or booking data is missing.",400));
//         //after verification store something to the database ie(payemnt details etc) in my example i wil simply send success html file 

//         // console.log(response.data)
//         const htmlMessageUser = bookingMessageUser({
//             userData ,
//             tourData,
//             transaction_uuid: response.data.transaction_uuid,
//             ref_id: response.data.ref_id,
//             amount: response.data.total_amount,
//             advancePayment: userData.advancePayment,
//             laterPayment: userData.payLater,
//             bookingDate: new Date().toLocaleDateString()
//         });

//         const htmlMessageAdmin = bookingMessageAdmin({
//             userData,
//             tourData,
//             transaction_uuid: response.data.transaction_uuid,
//             ref_id: response.data.ref_id,
//             amount: response.data.total_amount,
//             advancePayment: userData.advancePayment,
//             laterPayment: userData.payLater,
//             bookingDate: new Date().toLocaleDateString()
//         });
//         // message sent to user
//        await sendMessage(res,userData.email,"Payment Details",htmlMessageUser);
//        await sendMessage(res,process.env.NODEMAILER_USER,"Payment Details",htmlMessageAdmin);

//         return res.status(200).json({
//             status: true,
//             message: "Success",
//             tourData: req.session.tourData,
//             userData: req.session.bookingData,
//             transaction_details: {
//                 status: response.data.status,
//                 ref_id: response.data.ref_id,
//                 amount: response.data.total_amount

//             }
//         });
//     } catch (error) {
//         return next(new errorHandler(error.message, error.statusCode || 500))
//     }
// }


module.exports.paymentSucess = async (req, res, next) => {
    try {
        

        if (!req.query.data) return next(new errorHandler("Server error.",500))
        const encodedData = req.query.data;

        const decodedData = JSON.parse(Buffer.from(encodedData, "base64").toString("utf-8"));
        const TotalAmt = decodedData["total_amount"].replace(/,/g, '')

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

       
        const userData= req.session.bookingData
        const tourData= req.session.tourData
        if(!userData || !tourData)return next(new errorHandler("User data or booking data is missing.",400));
        //after verification store something to the database ie(payemnt details etc) in my example i wil simply send success html file 

        // console.log(response.data)
        const htmlMessageUser = bookingMessageUser({
            userData ,
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
       await sendMessage(res,userData.email,"Payment Details",htmlMessageUser);
       await sendMessage(res,process.env.NODEMAILER_USER,"Payment Details",htmlMessageAdmin);
       res.status(200).json({
        status:true,
        message:"Payment sucessfull"
       })

        // return res.status(200).json({
        //     status: true,
        //     message: "Success",
        //     tourData: req.session.tourData,
        //     userData: req.session.bookingData,
        //     transaction_details: {
        //         status: response.data.status,
        //         ref_id: response.data.ref_id,
        //         amount: response.data.total_amount

        //     }
        // });
    } catch (error) {
        return next(new errorHandler(error.message, error.statusCode || 500))
    }
}

module.exports.paymentFailure = async (req, res, next) => {
    try {
        res.status(500).json({
            status: false,
            message: 'Transaction failed.Please try again later.',
        });


    } catch (error) {
        return next(new errorHandler(error.message, error.statusCode || 500))

    }
}