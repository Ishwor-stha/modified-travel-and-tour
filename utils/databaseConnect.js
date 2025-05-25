const mongoose = require('mongoose');
const errorHandling = require('./errorHandling');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const databaseConnect = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.DATABASE, {
      serverSelectionTimeoutMS: 10000
    }).then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB connected successfully.");
    return cached.conn;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw new errorHandling(error.message || "MongoDB connection failed", 500);
  }
};

module.exports = { databaseConnect };


// const mongoose = require('mongoose');
// const errorHandling = require('./errorHandling');

// let cached = global.mongoose;

// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// module.exports.databaseConnect = async () => {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     cached.promise = mongoose.connect(process.env.DATABASE, {
//       serverSelectionTimeoutMS: 10000,
//     }).then((mongoose) => {
//       return mongoose;
//     });
//   }

//   try {
//     cached.conn = await cached.promise;
//     console.log("Database connected successfully.");
//     return cached.conn;
//   } catch (error) {
//     console.error(`MongoDB connection error: ${error.message}`);
//     throw new errorHandling(error.message || "MongoDB connection failed", 500);
//   }
// };

// const errorHandling=require("./errorHandling");
// const mongoose=require("mongoose");
// module.exports.databaseConnect=async ()=> {
//     try {
//         await mongoose.connect(process.env.DATABASE);
//         console.log("Database connected successfully");
//     } catch (error) {
//         console.error(`\nError connecting to the database:\nFirst check your internet connection.\n${error.message}`);
//         // Handle error 
//         throw new errorHandling(error.message, 500);

//     }
// }

// const mongoose = require("mongoose");
// const errorHandling = require("./errorHandling");

// let isConnected = false; 

// module.exports.databaseConnect = async () => {
//   if (isConnected) return;

//   try {
//     const conn = await mongoose.connect(process.env.DATABASE, {
      
//       serverSelectionTimeoutMS: 10000, 
//     });

//     isConnected = conn.connections[0].readyState === 1;
//     if (isConnected) {
//       console.log(" Database connected sucessfully.");
//     } else {
//       throw new Error("MongoDB connection not ready");
//     }
//   } catch (error) {
//     console.error(`MongoDB connection error: ${error.message}`);
//     throw new errorHandling(error.message || "MongoDB connection failed", 500);
//   }
// };