const express = require("express");
const mongoose = require("mongoose");
const Entry = require("../models/entry");  // apne path ke hisaab se adjust karna

const app = express();
app.use(express.json());



// Post /entry/create 
app.post("/", async (req, res) => {
  try {
    const {
      createdBy,
      companyId,
      type,
      categoryId,
      subCategoryId,
      year,
      entries
    } = req.body;

    // Validate required fields
    if (!createdBy || !companyId || !type || !categoryId || !subCategoryId || !year || !Array.isArray(entries)) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Validate each entry in the entries array
    for (const entry of entries) {
      if (
        typeof entry.month !== "number" ||
        typeof entry.budget !== "number" ||
        typeof entry.actual !== "number"
      ) {
        return res.status(400).json({
          message: "Each entry must include numeric month, budget, and actual"
        });
      }
    }

    // Check if an entry already exists for that subCategory and year
    let existing = await Entry.findOne({ subCategoryId, year });

    if (existing) {
      const updatedEntries = [...existing.entries];

      for (const newEntry of entries) {
        const exists = updatedEntries.find(
          (e) => Number(e.month) === Number(newEntry.month)
        );

        if (exists) {
          return res.status(409).json({
            message: `Entry for month ${newEntry.month} ${year} already exists`
          });
        }

        updatedEntries.push(newEntry);
      }

      existing.entries = updatedEntries;
      await existing.save();

      return res.status(200).json({
        message: "New months added to existing year entry",
        data: existing
      });

    } else {
      // No entry exists for the subCategory/year → create new
      const newEntry = new Entry({
        createdBy,
        companyId,
        type,
        categoryId,
        subCategoryId,
        year,
        entries
      });

      await newEntry.save();

      return res.status(201).json({
        message: "New yearly entry created",
        data: newEntry
      });
    }
  } catch (err) {
    console.error("POST /entry error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
 // delete by id 
 app.delete("/delete", async (req, res) => {
  try {
    const { entryId, entryItemId } = req.body;

    if (!entryId || !entryItemId) {
      return res.status(400).json({ message: "Please provide both entryId and entryItemId" });
    }

    // Step 1: Find the parent document directly using entryId
    const entryDoc = await Entry.findById(entryId);
    if (!entryDoc) {
      return res.status(404).json({ message: "Parent entry document not found" });
    }

    // Step 2: Filter out the sub-entry to be deleted
    const filteredEntries = entryDoc.entries.filter(
      (e) => e._id.toString() !== entryItemId
    );

    // If no item was removed (entryItemId not found)
    if (filteredEntries.length === entryDoc.entries.length) {
      return res.status(404).json({ message: "Entry item to delete not found" });
    }

    // Step 3: Update entries array
    entryDoc.entries = filteredEntries;

    // Step 4: Delete the whole parent document if entries is now empty
    if (entryDoc.entries.length === 0) {
      await Entry.deleteOne({ _id: entryId });
      return res.status(200).json({ message: "Entry item deleted. No entries left, document removed." });
    }

    // Step 5: Save updated document
    await entryDoc.save();

    return res.status(200).json({ message: "Entry item deleted successfully", data: entryDoc });

  } catch (error) {
    console.error("Error deleting entry item:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// 2. Get and Sum all entries for a subCategoryId (table data)
app.get("/full/:subCategoryId", async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    const yearQuery = req.query.year ? parseInt(req.query.year) : null;

    const filter = { subCategoryId };
    if (yearQuery) filter.year = yearQuery;

    const allEntries = await Entry.find(filter).sort({ year: -1 });

    const tableData = [];
    let overallBudget = 0;
    let overallActual = 0;
    const yearlySummary = [];

    for (const entry of allEntries) {
      let yearBudget = 0;
      let yearActual = 0;

      for (const monthEntry of entry.entries) {
        tableData.push({
          year: entry.year,
          month: monthEntry.month,
          budget: monthEntry.budget,
          actual: monthEntry.actual,
          _id: monthEntry._id,        // 👈 add entry item ID
          entryId: entry._id          // 👈 optional: parent document ID
        });

        overallBudget += monthEntry.budget;
        overallActual += monthEntry.actual;

        yearBudget += monthEntry.budget;
        yearActual += monthEntry.actual;
      }

      yearlySummary.push({
        year: entry.year,
        totalBudget: yearBudget,
        totalActual: yearActual,
        difference: yearActual - yearBudget
      });
    }

    res.json({
      table: tableData,
      overall: {
        totalBudget: overallBudget,
        totalActual: overallActual,
        difference: overallActual - overallBudget
      },
      yearly: yearlySummary
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// 2. Get and sum Data for entries  by using CategoryId (all Sub-categories are under categories data)
app.get("/category/:categoryId/full", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const year = req.query.year ? parseInt(req.query.year) : null;

    // Directly match on categoryId (no SubCategory lookup required)
    const filter = { categoryId };
    if (year) filter.year = year;

    // Pull all Entry docs for that category
    const entries = await Entry.find(filter);

    let totalBudget = 0, totalActual = 0;
    for (const entry of entries) {
      for (const month of entry.entries) {
        totalBudget += month.budget;
        totalActual += month.actual;
      }
    }

    return res.json({
      categoryId,
      totalBudget,
      totalActual,
      difference: totalActual - totalBudget
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Total Revenue and Expense and Net Profit
app.get("/company/:companyId/summary", async (req, res) => {
  try {
    const { companyId } = req.params;
    const year = req.query.year ? parseInt(req.query.year) : null;

    const filter = { companyId };
    if (year) filter.year = year;

    const entries = await Entry.find(filter);

    let totalRevenue = 0;
    let totalExpense = 0;

    for (const entry of entries) {
      for (const monthEntry of entry.entries) {
        if (entry.type === "revenue") {
          totalRevenue += monthEntry.actual;
        } else if (entry.type === "expense") {
          totalExpense += monthEntry.actual;
        }
      }
    }

    res.json({
      companyId,
      year: year || "all years",
      totalRevenue,
      totalExpense,
      netProfit: totalRevenue - totalExpense,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/company/:companyId/summary-all-years", async (req, res) => {
  try {
    const { companyId } = req.params;

    const entries = await Entry.find({ companyId });

    const yearMap = {};

    for (const entry of entries) {
      const year = entry.year;
      if (!yearMap[year]) {
        yearMap[year] = { revenue: 0, expense: 0 };
      }

      for (const monthEntry of entry.entries) {
        if (entry.type === "revenue") {
          yearMap[year].revenue += monthEntry.actual;
        } else if (entry.type === "expense") {
          yearMap[year].expense += monthEntry.actual;
        }
      }
    }

    const result = Object.entries(yearMap).map(([year, data]) => ({
      year: parseInt(year),
      revenue: data.revenue,
      expense: data.expense,
      netProfit: data.revenue - data.expense,
    }));

    res.json({ companyId, yearly: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// total sum of companies means (manager having 2 companies) so total of both companies ( net profit, revenue, expense)

app.get("/summary/createdBy/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all entries created by the user
    const entries = await Entry.find({ createdBy: userId });

    let totalRevenue = 0;
    let totalExpense = 0;

    for (const entry of entries) {
      for (const monthEntry of entry.entries) {
        if (entry.type === "revenue") {
          totalRevenue += monthEntry.actual;
        } else if (entry.type === "expense") {
          totalExpense += monthEntry.actual;
        }
      }
    }

    res.json({
      createdBy: userId,
      totalRevenue,
      totalExpense,
      netProfit: totalRevenue - totalExpense
    });

  } catch (error) {
    console.error("Summary error:", error);
    res.status(500).json({ message: "Server error" });
  }
});






module.exports = app;
