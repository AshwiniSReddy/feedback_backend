const mongoose = require("mongoose");

const connectDB=()=>{
    mongoose.set("strictQuery",false);
    mongoose.connect("mongodb+srv://digital:digitalparam@cluster0.hiukp1m.mongodb.net/").then((res)=>{
            console.log("Connected to DB")
    });
}

module.exports=connectDB