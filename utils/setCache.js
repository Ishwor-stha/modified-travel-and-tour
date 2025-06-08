const { client } = require("../utils/redis")
module.exports.setCache = async (url, response)=>{
    const cacheKey = `cache:${url}`;
    await client.setEx(cacheKey, 600, JSON.stringify(response));
}