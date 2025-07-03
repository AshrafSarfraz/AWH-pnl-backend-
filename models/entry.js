const mongoose = require("mongoose");

const EntrySchema = new mongoose.Schema({
  createdBy: { type: String, required: true },
  companyId: { type: String, required: true },
  type: { type: String, required: true },
  categoryId: { type: String, required: true }, 
  subCategoryId: { type: String, required: true },
  year: { type: Number, required: true },
  entries: [
    {
      month: { type: Number, required: true },
      budget: { type: Number, required: true },
      actual: { type: Number, required: true }
    }
  ]
});

const Entry = mongoose.model("Entry", EntrySchema);
module.exports = Entry;
