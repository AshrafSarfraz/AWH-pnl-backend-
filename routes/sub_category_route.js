const express = require("express");
const router = express.Router();
const SubCategory = require("../models/sub_categories");

router.post("/", async (req, res) => {
  const { name, categoryId } = req.body;

  if (!name || !categoryId) return res.status(400).json({ success: false, error: "Missing fields" });

  try {
    const subCategory = new SubCategory({ name, categoryId });
    await subCategory.save();
    res.status(201).json({ success: true, subCategory });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
