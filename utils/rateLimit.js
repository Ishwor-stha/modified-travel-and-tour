const rateLimit=require("express-rate-limit");
// Define rate limit configuration
module.exports.limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  headers: true,
  // Only trust the proxy for certain IPs (if necessary) or set to 1 for a single trusted proxy
  trustProxy: 1, // or use a specific IP or set to 'true' for all proxies
});

