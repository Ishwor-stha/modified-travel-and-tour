const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingData: {
        type: Object, // Store the entire bookingData object
        required: true
    },
    tourId: {
        type: mongoose.Schema.ObjectId, // Reference to the Tour model
        ref: 'Tour', // Assuming your Tour model is named 'Tour'
        required: true
    },
    transaction_uuid: {
        type: Number,
        required: true,
        unique: true
    }
   
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
