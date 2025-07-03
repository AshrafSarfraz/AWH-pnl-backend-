const express = require("express");
const router = express.Router();
const Company = require("../models/company");

// ✅ 1. Create new company
router.post("/", async (req, res) => {
  const { name, description, createdBy } = req.body;

  if (!name || !createdBy) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  try {
    const company = new Company({ name, description, createdBy });
    await company.save();
    res.status(201).json({ success: true, company });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ✅ 2. Get companies by user ID

  
router.post("/by-user", async (req, res) => {
  const { createdBy } = req.body;

  if (!createdBy) {
    return res.status(400).json({ success: false, error: "User ID required" });
  }

  try {
    // Yahan koi ObjectId conversion nahi
    const companies = await Company.find({ createdBy });
    res.status(200).json({ success: true, companies });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.put("/:companyId", async (req, res) => {
  const { name } = req.body;
  const { companyId } = req.params;

  if (!name) {
    return res.status(400).json({ success: false, error: "New name is required" });
  }

  try {
    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      { name },
      { new: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({ success: false, error: "Company not found" });
    }

    res.status(200).json({ success: true, company: updatedCompany });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.delete("/:companyId", async (req, res) => {
  const { companyId } = req.params;

  try {
    const deletedCompany = await Company.findByIdAndDelete(companyId);

    if (!deletedCompany) {
      return res.status(404).json({ success: false, error: "Company not found" });
    }

    res.status(200).json({ success: true, message: "Company deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});


module.exports = router;
