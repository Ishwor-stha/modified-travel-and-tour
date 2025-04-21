const nodemailer = require('nodemailer');

const sendMessage = async (res,email, subject, message) => {
    try {
        // Create a transporter object
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_USER.PASSWORD 
            }
        });

        
        const mailOptions = {
            from: process.env.NAME,
            to: email,
            subject: subject,
            html: message
        };

        
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
      res.status(500).json({
        status:false,
        message:"Email cannot be sent please try again later."
      })
        console.log('Error:', error);
    }
};

module.exports = {
    sendMessage
};
