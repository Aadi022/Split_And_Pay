const mongoose= require("mongoose");

const UserSchema= new mongoose.Schema({
    name: String,
    email: String,
    mobile: String,
    username: String,    //Unique
    password: String,
    groups: [String],
    balance: {
      owes: [
        {
          groupName: String,
          to: String,     //Username of the person
          amount: Number
        }
      ],
      owed_by: [
        {
          groupName: String,
          from: String,    //Username of the person
          amount: Number
        }
      ]
    }
});

module.exports= UserSchema;