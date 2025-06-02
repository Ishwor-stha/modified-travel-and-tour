const app = require("./app");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Define the port

// Start the server
const PORT = process.env.PORT || 3000;
 app.listen(PORT, () => {
     console.log(`Server is running on port ${PORT}`);
     console.log(`App is running in ${process.env.NODE_ENV} mode`);
 });
// module.exports=(req,res)=>app(req,res);
