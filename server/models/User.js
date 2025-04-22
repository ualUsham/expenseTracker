const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: String,
  email: String,
  roles: [
    {
      team: { type: String, required: true }, role: { type: String, enum: ["approver", "member"], required: true }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
