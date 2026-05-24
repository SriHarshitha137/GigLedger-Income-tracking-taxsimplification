const express = require('express');
const mongoose = require('mongoose');
const IncomeEntry = require('../models/IncomeEntry');
const localAdvisoryService = require('../services/localAdvisoryService');
const { calculateTax } = require('../services/taxEngine');

const router = express.Router();

router.get('/tax-advisory', async (req, res, next) => {
  try {
    const taxSnapshot = await calculateTax(req.userId);
    const sixMonthStart = new Date();
    sixMonthStart.setMonth(sixMonthStart.getMonth() - 6);
    sixMonthStart.setHours(0, 0, 0, 0);
    const [sixMonthIncome] = await IncomeEntry.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId), date: { $gte: sixMonthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const [topPlatform] = await IncomeEntry.aggregate([
      { $match: { userId: taxSnapshot.userId } },
      { $group: { _id: '$platform', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 1 }
    ]);

    const advice = await localAdvisoryService.getTaxAdvisory(req.userId, {
      grossIncome: taxSnapshot.grossIncome,
      taxableIncome: taxSnapshot.taxableIncome,
      estimatedTax: taxSnapshot.estimatedTaxLiability,
      gstAlert: taxSnapshot.gstThresholdAlert,
      topPlatform: topPlatform?._id || 'Not available',
      deductibleExpenses: taxSnapshot.expenseDeductions,
      averageMonthlyIncome: Math.round((sixMonthIncome?.total || 0) / 6)
    });

    return res.json({ success: true, data: { advice } });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
