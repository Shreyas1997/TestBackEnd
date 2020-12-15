const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String },
  a: { type: String },
  b: { type: String },
  c: { type: String },
  d: { type: String },
  correctOption: { type: String },
  testID: { type: String },
});

module.exports = mongoose.model("Question", questionSchema);
