const Tour = require("../modles/tourModel");
const errorHandler = require("../utils/errorHandling");


// content-based recommendation algorithm 
const calculateTourSimilarity = (tour1, tour2) => {
    let score = 0;
    const attributes = [
        "country",
        "region",
        "natureOfTour",
        "activity",
        "grade",
        "accomodation",
        "mealsIncluded",
        "transportation"
    ];

    attributes.forEach(attr => {
        if (tour1[attr] && tour2[attr] && tour1[attr] === tour2[attr]) {
            score++;
        }
    });

    // Consider numerical attributes with a tolerance or range
    if (tour1.groupSize && tour2.groupSize && Math.abs(tour1.groupSize - tour2.groupSize) <= 5) { 
        score++;
    }
    

    return score;
};


module.exports.getSimilarTours = async (tourId, limit = 5) => {
    try {
        const targetTour = await Tour.findById(tourId);
        if (!targetTour) {
            throw new errorHandler("Target tour not found.", 404);
        }

        const allTours = await Tour.find({ _id: { $ne: tourId } }); // Exclude the target tour itself

        const scoredTours = allTours.map(tour => ({
            tour: tour,
            similarity: calculateTourSimilarity(targetTour, tour)
        }));

        // Sort by similarity in descending order and take the top 'limit' tours
        const recommendedTours = scoredTours
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit)
            .map(item => item.tour);

        return recommendedTours;

    } catch (error) {
        console.error("Error getting similar tours:", error);
        
        throw new errorHandler(error.message, error.statusCode || 500);
    }
};
