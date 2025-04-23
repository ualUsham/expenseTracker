const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  mail: { type: String, required: true },
  team: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },  
  updatedAt: { type: Date, default: Date.now },  
  description: String,
  amount: Number,
  remarks: String,
  status: { type: String, default: "pending" },
});

module.exports = mongoose.model("Expense", expenseSchema);
