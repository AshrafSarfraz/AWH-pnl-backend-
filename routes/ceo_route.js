const express = require("express");
const router = express.Router();

const Entry = require("../models/entry");
const User = require("../models/user");
const Company = require("../models/company");

router.get("/", async (req, res) => {
  try {
    const managers = await User.find({ role: "manager" });
    const entries = await Entry.find({});

    const groupMap = {};
    const yearMap = {};
    const companyMap = {};

    let totalRevenue = 0;
    let totalExpense = 0;

    for (const manager of managers) {
      const group = manager.group;
      const managerId = manager._id.toString();

      // Initialize groupMap if not exists
      if (!groupMap[group]) {
        groupMap[group] = {
          revenue: 0,
          expense: 0,
          managerIds: new Set(), // use Set to avoid duplicates
        };
      }

      // Save manager ID in group
      groupMap[group].managerIds.add(managerId);

      const managerEntries = entries.filter((e) => e.createdBy === managerId);

      for (const entry of managerEntries) {
        for (const month of entry.entries) {
          // Group total
          if (entry.type === "revenue") {
            groupMap[group].revenue += month.actual;
            totalRevenue += month.actual;
          } else if (entry.type === "expense") {
            groupMap[group].expense += month.actual;
            totalExpense += month.actual;
          }

          // Yearly summary
          const year = entry.year;
          if (!yearMap[year]) yearMap[year] = { revenue: 0, expense: 0 };
          if (entry.type === "revenue") yearMap[year].revenue += month.actual;
          if (entry.type === "expense") yearMap[year].expense += month.actual;

          // Company summary
          const companyId = entry.companyId;
          if (!companyMap[companyId]) companyMap[companyId] = { revenue: 0, expense: 0 };
          if (entry.type === "revenue") companyMap[companyId].revenue += month.actual;
          if (entry.type === "expense") companyMap[companyId].expense += month.actual;
        }
      }
    }

    // Convert groupMap to array
    const groupSummary = Object.entries(groupMap).map(([group, data]) => ({
      group,
      revenue: data.revenue,
      expense: data.expense,
      netProfit: data.revenue - data.expense,
      managerIds: Array.from(data.managerIds),
    }));

    // Yearly Summary
    const yearlySummary = Object.entries(yearMap)
      .map(([year, data]) => ({
        year: parseInt(year),
        revenue: data.revenue,
        expense: data.expense,
        netProfit: data.revenue - data.expense,
      }))
      .sort((a, b) => b.year - a.year);

    // Top Companies
    const topCompaniesRaw = Object.entries(companyMap)
      .map(([companyId, data]) => ({
        companyId,
        revenue: data.revenue,
        expense: data.expense,
        netProfit: data.revenue - data.expense,
      }))
      .sort((a, b) => b.netProfit - a.netProfit)
      .slice(0, 5);

    const topCompanies = [];
    for (const item of topCompaniesRaw) {
      const company = await Company.findById(item.companyId);
      topCompanies.push({
        companyId: item.companyId,
        companyName: company ? company.name : "Unknown",
        ...item,
      });
    }

    // Response
    res.json({
      groupSummary,
      overall: {
        totalRevenue,
        totalExpense,
        netProfit: totalRevenue - totalExpense,
      },
      topCompanies,
      yearlySummary,
    });
  } catch (error) {
    console.error("CEO dashboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
