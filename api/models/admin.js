const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  adminName: { type: String },
  password: { type: String, require: true, max: 1024, min: 6 },
});

module.exports = mongoose.model("Admin", adminSchema);
