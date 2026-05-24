const mongoose = require('mongoose');

const incomeEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    platform: {
      type: String,
      enum: ['Ola', 'Uber', 'Swiggy', 'Zomato', 'Dunzo', 'Urban Company', 'Rapido', 'Other'],
      required: true
    },
    date: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    hoursWorked: { type: Number, default: 0 },
    tips: { type: Number, default: 0 },
    source: { type: String, enum: ['manual', 'sms_parsed'], default: 'manual' },
    notes: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('IncomeEntry', incomeEntrySchema);
