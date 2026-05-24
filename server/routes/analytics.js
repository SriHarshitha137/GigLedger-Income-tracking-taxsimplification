const express = require('express');
const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const IncomeEntry = require('../models/IncomeEntry');
const { calculateLoanEligibility } = require('../services/loanService');
const { calculateTax, getFinancialYearWindow } = require('../services/taxEngine');

const router = express.Router();
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const sumIncome = async (match) => {
  const [result] = await IncomeEntry.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
  return result?.total || 0;
};

const sumExpenses = async (match) => {
  const [result] = await Expense.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
  return result?.total || 0;
};

router.get('/summary', async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const fy = getFinancialYearWindow(now);

    const [totalAllTime, thisMonth, thisYear, totalExpenses, deductibleExpenses, byPlatform, taxSnapshot] = await Promise.all([
      sumIncome({ userId }),
      sumIncome({ userId, date: { $gte: monthStart, $lte: monthEnd } }),
      sumIncome({ userId, date: { $gte: fy.start, $lte: fy.end } }),
      sumExpenses({ userId }),
      sumExpenses({ userId, isDeductible: true }),
      IncomeEntry.aggregate([
        { $match: { userId } },
        { $group: { _id: '$platform', total: { $sum: '$amount' }, entryCount: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),
      calculateTax(userId)
    ]);

    return res.json({
      success: true,
      data: {
        totalAllTime,
        thisMonth,
        thisYear,
        totalExpenses,
        deductibleExpenses,
        byPlatform: byPlatform.map((item) => ({ platform: item._id, total: item.total, entryCount: item.entryCount })),
        taxSnapshot,
        gstThresholdAlert: taxSnapshot.gstThresholdAlert,
        estimatedTax: taxSnapshot.estimatedTaxLiability,
        netAfterExpenses: totalAllTime - totalExpenses
      }
    });
  } catch (err) {
    return next(err);
  }
});

router.get('/monthly-trend', async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const start = new Date();
    start.setMonth(start.getMonth() - 11, 1);
    start.setHours(0, 0, 0, 0);

    const rows = await IncomeEntry.aggregate([
      { $match: { userId, date: { $gte: start } } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    return res.json({
      success: true,
      data: rows.map((row) => ({
        year: row._id.year,
        month: row._id.month,
        monthName: monthNames[row._id.month - 1],
        total: row.total
      }))
    });
  } catch (err) {
    return next(err);
  }
});

router.get('/platform-comparison', async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const rows = await IncomeEntry.aggregate([
      { $match: { userId } },
      { $group: { _id: '$platform', total: { $sum: '$amount' }, entryCount: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);
    const total = rows.reduce((sum, row) => sum + row.total, 0);
    return res.json({
      success: true,
      data: rows.map((row) => ({
        platform: row._id,
        total: row.total,
        percentage: total ? (row.total / total) * 100 : 0,
        entryCount: row.entryCount
      }))
    });
  } catch (err) {
    return next(err);
  }
});

router.get('/earning-heatmap', async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const rows = await IncomeEntry.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { $dayOfWeek: '$date' },
          avgAmount: { $avg: '$amount' },
          totalAmount: { $sum: '$amount' },
          entryCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const byDay = new Map(rows.map((row) => [row._id, row]));
    const data = Array.from({ length: 7 }, (_, index) => {
      const dayOfWeek = index + 1;
      const row = byDay.get(dayOfWeek);
      return {
        dayOfWeek,
        dayName: dayNames[index],
        avgAmount: Math.round(row?.avgAmount || 0),
        totalAmount: row?.totalAmount || 0,
        entryCount: row?.entryCount || 0
      };
    });

    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
});

router.get('/loan-eligibility', async (req, res, next) => {
  try {
    const data = await calculateLoanEligibility(req.userId, req.query.type);
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
