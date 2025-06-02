const mongoose = require("mongoose");
const tourSchema = new mongoose.Schema({
    tourName: {
        type: "String",
        required: [true, "Name of tour is missing"]
    },
    country: {
        type: "String",
        required: [true, "Country of tour  is missing."],

    },
    originalPrice: {
        type: Number,
        required: [true, "A original price is missing."]
    },
    discountedPrice: {
        type: Number,

    },
    accomodation: {
        type: String,
        require: [true, "Accomodation field is empty."]
    },
    region: {
        type: String,
        require: [true, "Region field is empty."]
    },
    distance: {
        type: String,
        require: [true, "Distance field is empty."]
    },
    startPoint: {
        type: String,
        require: [true, "Starting point field is empty."]


    },
    endPoint: {
        type: String,
        require: [true, "End point field is empty."]


    },
    duration: {
        type: String,
        require: [true, "Duration field is empty."]

    },
    maxAltitude: {
        type: String,
        require: [true, "Max altitude field is empty."]

    },
    mealsIncluded: {
        type: String,
        required: [true, "Meals included field is empty."]
    },
    groupSize: {
        type: Number,
        required: [true, "Group size field is empty."]
    },
    natureOfTour: {
        type: String,
        required: [true, "Nature of tour field is empty."]
    },
    bestSeason: {
        type: String,
        require: [true, "The season field is empty"]
    },
    activityPerDay: {
        type: String,
        required: [true, "Activity per day field is empty."]
    },
    activity: {
        type: String,
        required: [true, "Activity field is required"]
    },
    grade: {
        type: String,
        required: [true, "The grade field is missing."]//challenging moderate easy
    },
    transportation: {
        type: String,
        required: [true, "Transportation field is empty."]
    },
    images: [
        {
            url: String,//file path
            public_id: String,//filename
        }
    ],

    popularity: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0,
        validate: {
            validator: function (discount) {
                return discount >= 0 && discount <= 100;
            },
            message: "Discount must be between 0 and 100"
        }
    },
    slug: {
        type: String
    },
    thumbnail: {
        type: "String",
        required: [true, "thumbnail of tour is missing"]
    },


});



const Tour = mongoose.model("tour", tourSchema);
module.exports = Tour;
