
module.exports.preventHPP=(req, res, next)=> {
    const queryParams = req.query;
    const seenParams = new Set();

    // Filter out duplicate query parameters
    Object.keys(queryParams).forEach(key => {
        if (seenParams.has(key)) {
            delete queryParams[key]; // Remove duplicates
        } else {
            seenParams.add(key);
        }
    });

    // Pass the cleaned query parameters forward
    req.query = queryParams;
    next();
}