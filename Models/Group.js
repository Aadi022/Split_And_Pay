const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
  name: String,
  passcode: String,
  participants: [String], // List of usernames
  expenses: [
    {
      paid_by: String, // username who paid
      total_amount: Number,
      split_method: String, // 'equal', 'exact', 'percentage'
      transactions: [
        [
          {
            user: String, // Username of participant
            amount: Number
          }
        ]
      ]
    }
  ],
  createdAt: Date
});

module.exports = GroupSchema;
