const express = require("express");
const router = express.Router();
const SubCategory = require("../models/sub_categories");

// POST add subcategory
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



// GET subcategories by categoryId
router.post('/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId) return res.status(400).json({ error: "CategoryId is required" });

    const subCategories = await SubCategory.find({ categoryId });
    res.status(200).json({ success: true, subCategories });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// ✅ 3. Update a subcategory name
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name)
    return res.status(400).json({ success: false, error: "Name is required" });

  try {
    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    if (!updatedSubCategory)
      return res
        .status(404)
        .json({ success: false, error: "Subcategory not found" });

    res.status(200).json({ success: true, subCategory: updatedSubCategory });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});



// ✅ 4. Delete a subcategory
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await SubCategory.findByIdAndDelete(id);

    if (!deleted)
      return res
        .status(404)
        .json({ success: false, error: "Subcategory not found" });

    res.status(200).json({ success: true, message: "Subcategory deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});





module.exports = router;




