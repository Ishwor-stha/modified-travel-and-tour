const mongoose = require("mongoose");
const slugify = require("slugify");
const tourSchema = new mongoose.Schema({
    name: {
        type: "String",
        required: [true, "Name of prodct  is missing"],
        unique: [true, "Tour name already exists"]
    },
    country: {
        type: "String",
        required: [true, "Country of tour  is missing."],
   
    },
    adult_price: {
        type: Number,
        required: [true, "A adult price is missing"]
    },
    youth_price: {
        type: Number,
        required: [true, "A youth price is missing"]
    },
    description: {
        type: "String",
        required: [true, "A Product should have Description"]
    },
    placeName: {
        type: "String",
        required: [true, "A Tour Must have place name"]
    },
    district:{
        type:"String",
        required:[true,"A tour must have its district name"]
    },
    // image: {
    //     type: [String],
    //     validate: {
    //         validator: function (images) {
    //             return images && images.length > 0; // Ensure at least one image is provided
    //         },
    //         message: `At least one image is required for the tour .`
    //     }
    // },
    category: {
        type: String,
        required: [true, "Category is missing"]//luxury,holiday,vacation

    },
    pickup_destination:{
        type:String,
        required:[true,"A tour must have pickup point"]


    },
    drop_destination:{
        type:String,
        required:[true,"A tour must have droping point"]


    },
    tour_type: {
        type: String,
        required: [true, "Tour is missing tour type (Domestic,International)"],
        enum: ["domestic", "international"]
    },
    active_month: {
        type: [String],
        validate: {
            validator: function ( months) {
                months=months[0].split(",")
               
                const validMonths = [
                    "january", "february", "march", "april", "may", "june",
                    "july", "august", "september", "october", "november", "december"
                ];
                
                for (let month in months) {
                    
                    month=months[month]
                    if (!validMonths.includes(month.toLowerCase())) {
                        return false;
                    }
                }
                return true;
            },
            message: "Active month must contain valid month names"
        }
    },
    popularity: {
        type: Number,
        default: 0
    },
    minimumGuest: {
        type: Number,
        required: [true, "A tour must have a minimum number of people"],
        min: [1, " Mimimum  number of  people must be at least 1"],
        validate: {
            validator: Number.isInteger,
            message: "Minimum  number of people must be an integer"
        }
    },
    duration: {
        type: Number,
        required: [true, "Duration is Missing"],
        validate: {
            validator: function (value) {
                return typeof value === "number"
            },
            message: "Duration must be a number"
        }
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
    }

});
tourSchema.pre("save", function (next) {
    if (this.isModified("name")) {
        this.slug = slugify(this.name);
    }
    next();

})
tourSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate();
    if (update.name) {
        update.slug = slugify(update.name);
    }
    next();
});

const Tour = mongoose.model("tour", tourSchema);
module.exports = Tour;
