const mongoose = require("mongoose");

const descriptionSchema = new mongoose.Schema({
  tourId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tour",
    required: true
  },
  shortDescription: {
    type: String,
    required: [true, "Short description is required"]
  },
  detailedDescription: {
    type: String,
    required: [true, "Detailed description is required"]
  },
  highlights: {
    type: [String],  // Array of highlight points
    default: []
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Description = mongoose.model("Description", descriptionSchema);

module.exports = Description;
