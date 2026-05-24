const mongoose = require('mongoose');

const taxSnapshotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  financialYear: { type: String, required: true },
  grossIncome: { type: Number, default: 0 },
  presumptiveDeduction: { type: Number, default: 0 },
  expenseDeductions: { type: Number, default: 0 },
  taxableIncome: { type: Number, default: 0 },
  estimatedTaxLiability: { type: Number, default: 0 },
  gstThresholdAlert: { type: Boolean, default: false },
  generatedAt: { type: Date, default: Date.now }
});

taxSnapshotSchema.index({ userId: 1, financialYear: 1 }, { unique: true });

module.exports = mongoose.model('TaxSnapshot', taxSnapshotSchema);
