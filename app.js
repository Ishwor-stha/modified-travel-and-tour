const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
const express = require("express");
// const path=require("path");
const {databaseConnect}=require("./utils/databaseConnect");

const tourRoute = require("./route/tourRoute");
const adminRoute = require("./route/adminRoute");
const errorController = require('./controller/errorController');
const {sanitize}=require("./utils/filter")
const app = express();
// security packages
const {limiter} = require("./utils/rateLimit");
const helmet = require('helmet');
const cors = require('cors');
const {preventHPP}=require("./utils/preventHpp");

const corsOptions = {
    origin:[process.env.URL1,process.env.URL2],
    methods: ["GET", "POST","PATCH","DELETE"],
    credentials: true
}
// loading environment variables from .env file
dotenv.config();
app.set('trust proxy', 1);

// Middleware to parse incoming JSON requests
app.use(express.json({limit: '10kb'}))//limiting the json body size to 10 kb
app.use(express.urlencoded({ extended: true }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//security 
app.use(limiter);
app.use(helmet());
app.use(preventHPP);

app.use(cors(corsOptions));
//////////////////////////
app.use(cookieParser());
app.use((req,res,next)=>{
    sanitize(req,res,next);
})

// Function to connect to the database
databaseConnect().catch(err=>{
    app.use((req,res,next)=>next(err));
});

// Mount the tour route
app.use("/api/", tourRoute);
app.use("/api/admin/", adminRoute);




// New  way of catching unhandled routes 
app.all('/{*any}', (req, res, next) => {
    return res.status(400).json({
        status: "fail",
        message: "Invalid website path"
    });
})
// ..........................................................

// Global error handling middleware
app.use(errorController);

module.exports=app;
