const IncomeEntry = require('../models/IncomeEntry');
const Expense = require('../models/Expense');
const TaxSnapshot = require('../models/TaxSnapshot');

const getFinancialYearWindow = (today = new Date()) => {
  const year = today.getFullYear();
  const month = today.getMonth();
  const startYear = month >= 3 ? year : year - 1;
  const endYear = startYear + 1;

  return {
    label: `${startYear}-${String(endYear).slice(-2)}`,
    start: new Date(startYear, 3, 1),
    end: new Date(endYear, 2, 31, 23, 59, 59, 999)
  };
};

const sumAmount = async (Model, match) => {
  const [result] = await Model.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  return result?.total || 0;
};

const slabTax = (taxableIncome) => {
  if (taxableIncome <= 700000) return 0;

  const slabs = [
    { limit: 300000, rate: 0 },
    { limit: 600000, rate: 0.05 },
    { limit: 900000, rate: 0.1 },
    { limit: 1200000, rate: 0.15 },
    { limit: 1500000, rate: 0.2 },
    { limit: Infinity, rate: 0.3 }
  ];

  let previousLimit = 0;
  let tax = 0;

  for (const slab of slabs) {
    if (taxableIncome > previousLimit) {
      const taxableAtSlab = Math.min(taxableIncome, slab.limit) - previousLimit;
      tax += taxableAtSlab * slab.rate;
      previousLimit = slab.limit;
    }
  }

  return tax;
};

const calculateTax = async (userId) => {
  const financialYear = getFinancialYearWindow();
  const dateMatch = { $gte: financialYear.start, $lte: financialYear.end };

  const grossIncome = await sumAmount(IncomeEntry, { userId, date: dateMatch });
  const expenseDeductions = await sumAmount(Expense, { userId, date: dateMatch, isDeductible: true });
  const presumptiveDeduction = grossIncome * 0.5;
  const taxableIncome = Math.max(grossIncome - presumptiveDeduction - expenseDeductions, 0);
  const baseTax = slabTax(taxableIncome);
  const estimatedTaxLiability = Math.round(baseTax + baseTax * 0.04);
  const gstThresholdAlert = grossIncome > 2000000;

  return TaxSnapshot.findOneAndUpdate(
    { userId, financialYear: financialYear.label },
    {
      userId,
      financialYear: financialYear.label,
      grossIncome,
      presumptiveDeduction,
      expenseDeductions,
      taxableIncome,
      estimatedTaxLiability,
      gstThresholdAlert,
      generatedAt: new Date()
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();
};

module.exports = { calculateTax, getFinancialYearWindow };
