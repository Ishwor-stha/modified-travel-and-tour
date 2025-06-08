const { client } = require("../utils/redis");
module.exports.cache = async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    const cached = await client.get(key);
    if (cached) return res.status(200).json(JSON.parse(cached));
    
    next()

}