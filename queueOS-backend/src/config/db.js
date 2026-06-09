const mongoose = require("mongoose");
const connectDB=async()=>
{
    try
    {
        const conn=await mongoose.connect(process.env.MONGO_URL);
        console.log("The project is now connected with the mongoDB database");
    }
    catch(error)
    {
        console.error(`MongoDB error:${error.message}`);
        process.exit(1);
    }
};
module.exports=connectDB;