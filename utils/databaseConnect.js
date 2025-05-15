const errorHandling=require("./errorHandling");
const mongoose=require("mongoose");
module.exports.databaseConnect=async ()=> {
    try {
        await mongoose.connect(process.env.DATABASE,{serverSelectionTimeoutMS:10000});
        console.log("Database connected successfully");
    } catch (error) {
        console.error(`Error connecting to the database: ${error.message}`);
        // Handle error 
        throw new errorHandling(error.message, 500);

    }
}