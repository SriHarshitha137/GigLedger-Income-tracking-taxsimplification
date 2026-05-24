const express = require('express');
const { body, validationResult } = require('express-validator');
const Expense = require('../models/Expense');

const router = express.Router();
const categories = ['fuel', 'vehicle_emi', 'phone_recharge', 'vehicle_repair', 'food_while_working', 'insurance', 'other'];

const dateFilter = (startDate, endDate) => {
  if (!startDate && !endDate) return undefined;
  const filter = {};
  if (startDate) filter.$gte = new Date(startDate);
  if (endDate) filter.$lte = new Date(endDate);
  return filter;
};

router.get('/', async (req, res, next) => {
  try {
    const { category, startDate, endDate } = req.query;
    const filter = { userId: req.userId };
    if (category) filter.category = category;
    const date = dateFilter(startDate, endDate);
    if (date) filter.date = date;
    const expenses = await Expense.find(filter).sort({ date: -1 }).lean();
    return res.json({ success: true, data: expenses });
  } catch (err) {
    return next(err);
  }
});

router.post(
  '/',
  [body('category').isIn(categories), body('amount').isFloat({ gt: 0 }), body('date').isISO8601().toDate()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
      const expense = await Expense.create({ ...req.body, userId: req.userId });
      return res.status(201).json({ success: true, data: expense });
    } catch (err) {
      return next(err);
    }
  }
);

router.put('/:id', async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    return res.json({ success: true, data: expense });
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deleted) return res.status(404).json({ success: false, message: 'Expense not found' });
    return res.json({ success: true, message: 'Expense deleted' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
