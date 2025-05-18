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
    price: {
        type: Number,
        required: [true, "A adult price is missing."]
    },
    accomodation:{
        type:String,
        require:[true,"Accomodation field is empty."]
    },
    region:{
        type:String,
        require:[true,"Region field is empty."]
    },
    distance:{
      type:Number,
      require:[true,"Distance field is empty."]  
    },
    startPoint:{
        type:String,
        require:[true,"Starting point field is empty."]  


    },
     endPoint:{
        type:String,
        require:[true,"End point field is empty."]  


    },
    duration:{
        type:Number,
        require:[true,"Duration field is empty."]  
        
    },
    maxAltitude:{
        type:Number,
        require:[true,"Max altitude field is empty."]  

    },
    mealsIncluded: {
        type: String,
        required: [true, "Meals included field is empty."]
    },
      groupSize: {
        type: Nuumber,
        required: [true, "Group size field is empty."]
    },
    natureOfTour: {
        type: String,
        required: [true, "Nature of tour field is empty."]
    },
    bestSeason:{
        type:String,
        require:[true,"The season field is empty"]
    },
    activityPerDay: {
        type: String,
        required: [true, "Activity per day field is empty."]
    },
   transportation:{
        type:String,
        required:[true,"Transportation field is empty."]
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
