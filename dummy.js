app.get("/category/:categoryId/full", async (req, res) => {
    try {
      const { categoryId } = req.params;
      const yearQuery = req.query.year ? parseInt(req.query.year) : null;
  
      // Directly match on categoryId (no SubCategory lookup required)
      const filter = { categoryId };
      if (yearQuery) filter.year = yearQuery;
  
      // Pull all Entry docs for that category
      const allEntries = await Entry.find(filter).sort({ year: -1 });
  
     // Step 2: Prepare full table rows
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
          actual: monthEntry.actual
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