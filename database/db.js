const mongoose = require("mongoose");

const connectDb = async() => {
   try {
     await mongoose.connect(process.env.mongodb_URL);
     console.log("mongoDb connected");
   } catch (error) {
    console.error("mongoDb connection failed", error);
    process.exit(1);
    }
};


module.exports = connectDb;