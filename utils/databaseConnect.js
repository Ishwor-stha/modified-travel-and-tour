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

