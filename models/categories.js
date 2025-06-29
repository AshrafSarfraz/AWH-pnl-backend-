const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["revenue", "expense"], required: true },
  companyId: { type:String, required: true },
});

module.exports = mongoose.model("Category", categorySchema);
