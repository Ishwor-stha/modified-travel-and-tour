const  mongoose =require("mongoose");

const tourRatingSchema = new mongoose.Schema({
  tourId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent the same user from rating the same tour multiple times
tourRatingSchema.index({ tourId: 1, userId: 1 }, { unique: true });

const TourRating = mongoose.model('TourRating', tourRatingSchema);
module.exports= TourRating;
