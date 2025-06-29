const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema({
  subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory", required: true },
  budget: { type: Number, required: true },
  actual: { type: Number, required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
});

module.exports = mongoose.model("Entry", entrySchema);
