const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
const express = require("express");
const path=require("path");
const {databaseConnect}=require("./utils/databaseConnect");

const tourRoute = require("./route/tourRoute");
const adminRoute = require("./route/adminRoute");
const errorController = require('./controller/errorController');
const app = express();
// security packages
const {limiter} = require("./utils/rateLimit");
const helmet = require('helmet');
const cors = require('cors');
const {preventHPP}=require("./utils/preventHpp");

const corsOptions = {
    // origin: process.env.URL,
    origin:["http://localhost:5173","http://localhost:6000"],
    methods: ["GET", "POST","PATCH","DELETE"]
}
// loading environment variables from .env file
dotenv.config();
app.set('trust proxy', true);

// Middleware to parse incoming JSON requests
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json({limit: '10kb'}))//limiting the json body size to 10 kb
//security 
// app.use(limiter);
app.use(helmet());
app.use(preventHPP);
app.use(cors(corsOptions));
//////////////////////////
app.use(cookieParser());

// Function to connect to the database
databaseConnect();

// Mount the tour route
app.use("/api/", tourRoute);
app.use("/api/admin/", adminRoute);

// Handle any unhandled routes with a 404 error

// ....................................
// the below line of code doesnot on latest version of express because '*' no longer supports 
// app.all('*', (req, res) => {
//     res.status(400).json({
//         status: "fail",
//         message: "Invalid website path"
//     });
// });

// ..........................................................
app.use((req,res)=>{
    res.status(400).json({
        status: "fail",
        message: "Invalid website path"
    });
})
// Global error handling middleware
app.use(errorController);

module.exports=app;
