const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
const express = require("express");

const { databaseConnect } = require("./utils/databaseConnect");
const tourRoute = require("./route/tourRoute");
const adminRoute = require("./route/adminRoute");
const errorController = require('./controller/errorController');
const bookigAndEnquiryRoute = require("./route/enquiryAndBookRoute")
const { sanitize } = require("./utils/filter")
const app = express();
const session = require("express-session");
const MongoStore = require('connect-mongo'); // Import MongoStore
const path=require("path");
// security packages
const { limiter } = require("./utils/rateLimit");
const helmet = require('helmet');
const cors = require('cors');
const { preventHPP } = require("./utils/preventHpp");
// const errorHandling = require('./utils/errorHandling');



const corsOptions = {
    origin: [process.env.URL1, process.env.URL2, process.env.URL3],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
}
// loading environment variables from .env file
dotenv.config();
app.set('trust proxy', 1);

// Middleware to parse incoming JSON requests
app.use(express.json({ limit: '10kb' }))//limiting the json body size to 10 kb
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//security 
app.use(limiter);
app.use(helmet());
app.use(preventHPP);

app.use(cors(corsOptions));
//////////////////////////
app.use(cookieParser());
app.use((req, res, next) => {
    sanitize(req, res, next);
})
app.use(session({
    secret: process.env.SessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DATABASE, //  MongoDB connection string
        ttl: 1000 * 60 * 60, // Session TTL in seconds (1 hour)
        autoRemove: 'interval',
        autoRemoveInterval: 10 // In minutes. Removes expired sessions every 10 minutes
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Set to false for local HTTP testing
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Adjusted for local development
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
    },
}));

// Function to connect to the database
(async () => {
  try {
    await databaseConnect(); // Wait for MongoDB connection
  } catch (err) {
    console.error('DB connection failed:', err);
    // Exit the process if DB connection fails
    
  }
})();

// Mount the tour route
app.use("/api/", tourRoute);
app.use("/api/admin/", adminRoute);
app.use("/api/tour/", bookigAndEnquiryRoute);






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

module.exports = app;
