const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingData: {
        type: Object, // Store the entire bookingData object
        required: true
    },
    tourId: {
        type: mongoose.Schema.ObjectId,
        ref: 'tour',
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
