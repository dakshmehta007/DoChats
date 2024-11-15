const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // useFindAndModify: true,
        });

        console.log(`MongoDB Connected ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.log(`Error : ${error.message}`);
        process.exit();
    }
};
 
module.exports = connectDB;