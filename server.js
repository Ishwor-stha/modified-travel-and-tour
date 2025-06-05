const app = require("./app");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const startServer=()=>{
   // Define the port
    const PORT = process.env.PORT || 3000;
    // Start the server
     app.listen(PORT, () => {
         console.log(`Server is running on port ${PORT}`);
         console.log(`App is running in ${process.env.NODE_ENV} mode`);
     });
}

process.env.local?startServer():module.exports=(req,res)=>app(req,res);

