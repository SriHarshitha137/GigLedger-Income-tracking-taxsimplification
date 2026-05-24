const platforms = ['Ola', 'Uber', 'Swiggy', 'Zomato', 'Dunzo', 'Urban Company', 'Rapido'];

const detectPlatform = (text) => {
  const lower = text.toLowerCase();
  return platforms.find((platform) => lower.includes(platform.toLowerCase())) || 'Other';
};

const parseAmount = (text) => {
  const amountMatch = text.match(/(?:rs\.?|inr|₹)\s*([0-9,]+(?:\.\d{1,2})?)/i) || text.match(/([0-9,]+(?:\.\d{1,2})?)\s*(?:credited|received|paid|earned|payout|settled)/i);
  if (!amountMatch) return null;
  return Number(amountMatch[1].replace(/,/g, ''));
};

const parseDate = (text) => {
  const iso = text.match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;

  const indian = text.match(/\b(\d{1,2})[-/](\d{1,2})[-/](20\d{2})\b/);
  if (indian) return `${indian[3]}-${indian[2].padStart(2, '0')}-${indian[1].padStart(2, '0')}`;

  const named = text.match(/\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(20\d{2})\b/i);
  if (named) {
    const month = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(named[2].slice(0, 3).toLowerCase()) + 1;
    return `${named[3]}-${String(month).padStart(2, '0')}-${named[1].padStart(2, '0')}`;
  }

  return new Date().toISOString().slice(0, 10);
};

const parseSMSText = async (smsText) => {
  const amount = parseAmount(smsText);
  if (!amount) return { error: 'Could not parse SMS', confidence: 0 };

  const platform = detectPlatform(smsText);
  const hasCurrency = /(?:rs\.?|inr|₹)/i.test(smsText);
  const hasDate = /\b(20\d{2}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]20\d{2}|\d{1,2}\s+[a-z]{3,9}\s+20\d{2})\b/i.test(smsText);
  const confidence = Math.min(0.95, 0.45 + (platform !== 'Other' ? 0.2 : 0) + (hasCurrency ? 0.2 : 0) + (hasDate ? 0.1 : 0));
  const confidenceLabel = confidence >= 0.8 ? 'high' : confidence >= 0.6 ? 'medium' : 'low';
  return { date: parseDate(smsText), amount, platform, confidence, confidenceLabel };
};

const getTaxAdvisory = async (userId, summary) => {
  const monthlyIncome = Math.round(summary.averageMonthlyIncome || summary.monthlyIncome || summary.grossIncome || 0);
  const grossIncome = Math.round(summary.grossIncome || 0);
  const taxableIncome = Math.round(summary.taxableIncome || 0);
  const deductions = Math.round(summary.deductibleExpenses || 0);
  const tax = Math.round(summary.estimatedTax || 0);
  const money = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
  const base = `Your current monthly income signal is ${money(monthlyIncome)} and FY gross income is ${money(grossIncome)}.`;

  if (monthlyIncome < 10000) {
    return `${base} At this level, your estimated tax is ${money(tax)}, so tax pressure is likely zero right now. Focus on recording every payout, keeping fuel and phone bills, and building a 6-month income trail. This improves awareness and future loan readiness.`;
  }

  if (monthlyIncome < 20000) {
    return `${base} You are still in a low-tax zone. After 44ADA and rebate checks, taxable income is ${money(taxableIncome)} and estimated tax is ${money(tax)}. Keep filing records clean because the 87A rebate can reduce tax when taxable income stays within eligible limits.`;
  }

  if (monthlyIncome < 35000) {
    return `${base} This is a good stage to use Presumptive Taxation Scheme 44ADA carefully: 50% of gross receipts are treated as deduction before tax. You have ${money(deductions)} in deductible expenses, so keep proofs for fuel, recharge, repairs, insurance, and EMI.`;
  }

  if (monthlyIncome < 60000) {
    const gstLine = summary.gstAlert ? 'GST threshold appears crossed, so registration review is important.' : 'GST threshold is not crossed yet, but monitor it monthly.';
    return `${base} Your taxable income estimate is ${money(taxableIncome)} and estimated tax is ${money(tax)}. 44ADA still helps, but your income is now high enough to plan tax cash flow. ${gstLine}`;
  }

  return `${base} This is a high-income gig profile. Estimated tax is ${money(tax)} on taxable income of ${money(taxableIncome)}. Start advance tax planning, keep platform-wise statements, and speak with a CA before filing. Also review GST status because higher receipts can cross compliance thresholds.`;
};

module.exports = { parseSMSText, getTaxAdvisory };
