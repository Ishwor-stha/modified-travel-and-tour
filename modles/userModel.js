const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
  
    name: {
        type: String,
        required: [true, " Name is Required"],
        maxlength: [50, "User name must not exceed 50 characters"],
        trim: true

    },

   
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other','male', 'female', 'other'],  
        required: [true, "Gender is required"],
        trim: true

    },

    
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
        trim: true
    },

    email: {
        type: String,
        unique: true,  // Ensure email is unique
        lowercase: true,
        trim: true

    },

   
    address: {
        type: String,
        required: [true, "Address is missing"]
    },

   

    password: {
        type: String,
        minlength: [8, "Minimum password length must be 8 characters"],
        required: [true, "Password field is missing"],
    },

    role: {
        type: String,
        enum: ["user","admin"],
        default: "user"
    },
    photo: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    
    registration_date: {
        type: Date,
        default: Date.now
    },
    code: {
        type: String
    },
    resetExpiry: {
        type: Number
    }



});


// Create and export the model
const user= mongoose.model('User', userSchema);

module.exports = user;
