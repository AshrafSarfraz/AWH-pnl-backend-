const express = require("express");
const router = express.Router();
const Entry = require("../models/entry");

router.post("/", async (req, res) => {
  const { subCategoryId, budget, actual, month, year } = req.body;

  if (!subCategoryId || !budget || !actual || !month || !year)
    return res.status(400).json({ success: false, error: "Missing fields" });

  try {
    const entry = new Entry({ subCategoryId, budget, actual, month, year });
    await entry.save();
    res.status(201).json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
