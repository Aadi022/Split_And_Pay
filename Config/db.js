const mongoose= require("mongoose");
const UserSchema= require("../Models/User.js");
const GroupSchema= require("../Models/Group.js");

try{
    mongoose.connect("mongodb+srv://aadityamta:am123@splitshare.2m0kl.mongodb.net/");
    console.log("Successfully connected to the database");
}catch{
    console.log("Could not connect to the Database");
}

const User= mongoose.model("User",UserSchema);
const Group= mongoose.model("Group",GroupSchema);


module.exports={
    User: User,
    Group: Group
}

