const express = require("express");
const router = express.Router();
const Category = require("../models/categories");

// Create new category
router.post("/", async (req, res) => {
  const { name, type, companyId } = req.body;

  if (!name || !type || !companyId) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  if (!["revenue", "expense"].includes(type)) {
    return res.status(400).json({ success: false, error: "Invalid category type" });
  }

  try {
    const category = new Category({ name, type, companyId });
    await category.save();
    res.status(201).json({ success: true, category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Get categories by companyId and optional type (revenue or expense)
router.get("/:companyId", async (req, res) => {
  const { companyId } = req.params;
  const { type } = req.query; // optional query param

  const filter = { companyId };
  if (type && ["revenue", "expense"].includes(type)) {
    filter.type = type;
  }

  try {
    const categories = await Category.find(filter);
    res.status(200).json({ success: true, categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});


router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, type } = req.body;

  if (!name && !type) {
    return res.status(400).json({ success: false, error: "Nothing to update" });
  }

  if (type && !["revenue", "expense"].includes(type)) {
    return res.status(400).json({ success: false, error: "Invalid category type" });
  }

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: { ...(name && { name }), ...(type && { type }) } },
      { new: true } // return updated doc
    );

    if (!updatedCategory) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    res.status(200).json({ success: true, category: updatedCategory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});


router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});



module.exports = router;
