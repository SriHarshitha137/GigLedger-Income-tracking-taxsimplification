const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const IncomeEntry = require('../models/IncomeEntry');
const pdfService = require('../services/pdfService');

const router = express.Router();

const periodMonths = { '3months': 3, '6months': 6, '12months': 12 };

router.get('/certificate', async (req, res, next) => {
  try {
    const period = periodMonths[req.query.period] ? req.query.period : '6months';
    const months = periodMonths[period];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const [user, entries, byPlatform] = await Promise.all([
      User.findById(req.userId).select('-passwordHash').lean(),
      IncomeEntry.find({ userId: req.userId, date: { $gte: startDate, $lte: endDate } }).lean(),
      IncomeEntry.aggregate([
        { $match: { userId: userIdObject(req.userId), date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$platform', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } }
      ])
    ]);

    const totalGross = entries.reduce((sum, entry) => sum + entry.amount, 0);
    const breakdown = byPlatform.map((row) => ({
      platform: row._id,
      total: row.total,
      percentage: totalGross ? (row.total / totalGross) * 100 : 0
    }));
    const pdfBuffer = await pdfService.generateCertificate(
      user,
      { totalGross, avgMonthly: totalGross / months, byPlatform: breakdown, startDate, endDate, entryCount: entries.length },
      period
    );

    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="income-certificate.pdf"');
    return res.send(pdfBuffer);
  } catch (err) {
    return next(err);
  }
});

function userIdObject(userId) {
  return new mongoose.Types.ObjectId(userId);
}

module.exports = router;
