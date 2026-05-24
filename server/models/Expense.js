const mongoose = require('mongoose');

const deductibleCategories = ['fuel', 'vehicle_emi', 'phone_recharge', 'vehicle_repair', 'insurance'];

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: {
      type: String,
      enum: ['fuel', 'vehicle_emi', 'phone_recharge', 'vehicle_repair', 'food_while_working', 'insurance', 'other'],
      required: true
    },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    description: { type: String },
    isDeductible: { type: Boolean }
  },
  { timestamps: true }
);

expenseSchema.pre('save', function setDeductible(next) {
  this.isDeductible = deductibleCategories.includes(this.category);
  next();
});

expenseSchema.pre('findOneAndUpdate', function setDeductibleOnUpdate(next) {
  const update = this.getUpdate();
  const category = update.category || update.$set?.category;
  if (category) {
    this.set({ isDeductible: deductibleCategories.includes(category) });
  }
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);
