const mongoose = require('mongoose');
const IncomeEntry = require('../models/IncomeEntry');

const loanProducts = {
  bike: { label: 'Bike loan', minIncome: 12000, multiplier: 8, baseRate: 14.5, tenures: [12, 18, 24, 36], cap: 180000 },
  car: { label: 'Car loan', minIncome: 30000, multiplier: 18, baseRate: 12.5, tenures: [36, 48, 60, 72], cap: 1200000 },
  home: { label: 'Home loan', minIncome: 60000, multiplier: 60, baseRate: 9.5, tenures: [120, 180, 240, 300], cap: 5000000 },
  education: { label: 'Education loan', minIncome: 20000, multiplier: 14, baseRate: 11.5, tenures: [24, 36, 48, 60], cap: 800000 }
};

const emi = (principal, annualRate, months) => {
  if (!principal || !months) return 0;
  const monthlyRate = annualRate / 12 / 100;
  if (!monthlyRate) return Math.round(principal / months);
  const value = (principal * monthlyRate * (1 + monthlyRate) ** months) / ((1 + monthlyRate) ** months - 1);
  return Math.round(value);
};

const getLastSixMonthsIncome = async (userId) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  startDate.setHours(0, 0, 0, 0);

  const objectId = new mongoose.Types.ObjectId(userId);
  const [totalRow] = await IncomeEntry.aggregate([
    { $match: { userId: objectId, date: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: null, total: { $sum: '$amount' }, entryCount: { $sum: 1 } } }
  ]);

  const monthlyRows = await IncomeEntry.aggregate([
    { $match: { userId: objectId, date: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const totalIncome = totalRow?.total || 0;
  return {
    totalIncome,
    averageMonthlyIncome: Math.round(totalIncome / 6),
    entryCount: totalRow?.entryCount || 0,
    monthlyBreakdown: monthlyRows.map((row) => ({ year: row._id.year, month: row._id.month, total: row.total }))
  };
};

const getInterestRate = (averageMonthlyIncome, product) => {
  if (averageMonthlyIncome >= product.minIncome * 3) return Math.max(product.baseRate - 2, 7.5);
  if (averageMonthlyIncome >= product.minIncome * 2) return Math.max(product.baseRate - 1, 8);
  if (averageMonthlyIncome >= product.minIncome) return product.baseRate;
  return product.baseRate + 3;
};

const calculateLoanEligibility = async (userId, loanType) => {
  const type = String(loanType || '').toLowerCase();
  const product = loanProducts[type];
  if (!product) {
    const err = new Error('Invalid loan type');
    err.statusCode = 400;
    throw err;
  }

  const income = await getLastSixMonthsIncome(userId);
  const requiredIncomeGap = Math.max(product.minIncome - income.averageMonthlyIncome, 0);
  const eligible = requiredIncomeGap === 0 && income.entryCount >= 6;
  const interestRate = getInterestRate(income.averageMonthlyIncome, product);
  const maxLoanAmount = eligible ? Math.min(Math.round(income.averageMonthlyIncome * product.multiplier), product.cap) : 0;
  const tenureOptions = product.tenures.map((months) => ({
    months,
    emi: eligible ? emi(maxLoanAmount, interestRate, months) : 0
  }));

  return {
    type,
    label: product.label,
    eligible,
    averageMonthlyIncome: income.averageMonthlyIncome,
    totalSixMonthIncome: income.totalIncome,
    entryCount: income.entryCount,
    maxLoanAmount,
    interestRate,
    tenureOptions,
    requiredIncomeGap,
    reason: eligible
      ? 'Eligible based on the last 6 months income records.'
      : income.entryCount < 6
        ? 'Add more income entries from the last 6 months to build a stronger proof trail.'
        : `Average monthly income is below the ${product.label} requirement.`
  };
};

module.exports = { calculateLoanEligibility };
