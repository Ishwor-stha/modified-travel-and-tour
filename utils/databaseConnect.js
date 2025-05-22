const errorHandling=require("./errorHandling");
const mongoose=require("mongoose");
module.exports.databaseConnect=async ()=> {
    try {
        await mongoose.connect(process.env.DATABASE);
        console.log("Database connected successfully");
    } catch (error) {
        console.error(`\nError connecting to the database:\nFirst check your internet connection.\n${error.message}`);
        // Handle error 
        throw new errorHandling(error.message, 500);

    }
}