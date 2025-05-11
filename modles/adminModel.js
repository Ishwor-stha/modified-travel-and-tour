const mongoose = require("mongoose");
const validator = require("validator"); // We'll use this to validate the email format
const bcrypt=require("bcryptjs");
const errorHandling = require("../utils/errorHandling");

const adminSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is Missing"],
    },
    password: {
        type: String,
        required: [true, "Password is Missing"],
        minlength: [8, "A password must have a minimum of 8 characters"]
    },
    confirmPassword: {
        type: String
       
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
    },

    email: {
        type: String,
        required: [true, "Email is missing"],
        lowercase: true,
        unique: [true,"This email is associated with an existing account. If you previously deleted your account, please contact support or try logging in."],
        validate: {
            validator: function (email) {
                if (!validator.isEmail(email)) {
                    return false
                }
                const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com"];
                const emailDomain = email.split('@')[1]; // Get the part after '@' ie [gmail.com,yahoo.com]

                return allowedDomains.includes(emailDomain); // Check if email format is valid  reutrns true of false
            },
            message: "Please enter a valid email address"
        }
    },
     role: {
        type: String,
        enum: "admin",
        default: "admin"
    },
    
    code: {
        resetToken: String
    },
    resetExpiry: {
        type: Number
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

// Pre-save hook to remove confirmPassword and hashing the password in the document before saving
adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // If password isn't modified, skip hashing

    // Hash the password
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        this.confirmPassword = undefined; // Remove confirmPassword from the saved document
        next();
    } catch (error) {
        next(new errorHandling(error,error.statusCode)); // Pass error to the next middleware if hashing fails
    }
});

const adminModel = mongoose.model("admin", adminSchema);

module.exports = adminModel;
