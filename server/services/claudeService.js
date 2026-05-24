const platforms = ['Ola', 'Uber', 'Swiggy', 'Zomato', 'Dunzo', 'Urban Company', 'Rapido'];

const detectPlatform = (text) => {
  const lower = text.toLowerCase();
  return platforms.find((platform) => lower.includes(platform.toLowerCase())) || 'Other';
};

const parseAmount = (text) => {
  const amountMatch = text.match(/(?:rs\.?|inr|₹)\s*([0-9,]+(?:\.\d{1,2})?)/i) || text.match(/([0-9,]+(?:\.\d{1,2})?)\s*(?:credited|received|paid|earned|payout)/i);
  if (!amountMatch) return null;
  return Number(amountMatch[1].replace(/,/g, ''));
};

const parseDate = (text) => {
  const iso = text.match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;

  const indian = text.match(/\b(\d{1,2})[-/](\d{1,2})[-/](20\d{2})\b/);
  if (indian) return `${indian[3]}-${indian[2].padStart(2, '0')}-${indian[1].padStart(2, '0')}`;

  return new Date().toISOString().slice(0, 10);
};

const parseSMSText = async (smsText) => {
  const amount = parseAmount(smsText);
  if (!amount) return { error: 'Could not parse SMS', confidence: 0 };

  const platform = detectPlatform(smsText);
  const confidence = platform === 'Other' ? 0.62 : 0.86;
  return { date: parseDate(smsText), amount, platform, confidence };
};

const getTaxAdvisory = async (userId, summary) => {
  const taxLine = summary.estimatedTax > 0
    ? `Estimated tax is Rs. ${summary.estimatedTax.toLocaleString('en-IN')}, so keep advance-tax planning ready.`
    : 'Your estimated tax is currently zero after rebate, but ITR filing may still be needed if income crosses filing limits.';
  const gstLine = summary.gstAlert
    ? 'GST registration should be reviewed because gross receipts crossed Rs. 20,00,000.'
    : 'GST registration is not triggered by the current gross receipts.';

  return `Aapka gross income is Rs. ${summary.grossIncome.toLocaleString('en-IN')} and top platform is ${summary.topPlatform}. Under Presumptive Taxation Scheme 44ADA, 50% of gross receipts are treated as deduction, so taxable income becomes about Rs. ${summary.taxableIncome.toLocaleString('en-IN')} after deductible expenses of Rs. ${summary.deductibleExpenses.toLocaleString('en-IN')}. ${taxLine} Keep fuel, phone recharge, insurance, vehicle repair, and EMI proofs safely because these support expense tracking. ${gstLine} Tension mat lo, yaar - this is a working estimate, and a CA can confirm final ITR treatment before filing.`;
};

module.exports = { parseSMSText, getTaxAdvisory };
