const express = require('express');
const { body, validationResult } = require('express-validator');
const IncomeEntry = require('../models/IncomeEntry');
const localAdvisoryService = require('../services/localAdvisoryService');

const router = express.Router();
const platforms = ['Ola', 'Uber', 'Swiggy', 'Zomato', 'Dunzo', 'Urban Company', 'Rapido', 'Other'];

const buildDateFilter = (startDate, endDate) => {
  if (!startDate && !endDate) return undefined;
  const filter = {};
  if (startDate) filter.$gte = new Date(startDate);
  if (endDate) filter.$lte = new Date(endDate);
  return filter;
};

router.get('/', async (req, res, next) => {
  try {
    const { platform, startDate, endDate } = req.query;
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const filter = { userId: req.userId };

    if (platform) filter.platform = platform;
    const date = buildDateFilter(startDate, endDate);
    if (date) filter.date = date;

    const entries = await IncomeEntry.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    const total = await IncomeEntry.countDocuments(filter);

    return res.json({ success: true, data: { entries, total, page, pages: Math.ceil(total / limit) || 1 } });
  } catch (err) {
    return next(err);
  }
});

router.post(
  '/',
  [
    body('platform').isIn(platforms),
    body('amount').isFloat({ gt: 0 }),
    body('date').isISO8601().toDate(),
    body('source').optional().isIn(['manual', 'sms_parsed'])
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
      const entry = await IncomeEntry.create({ ...req.body, userId: req.userId });
      return res.status(201).json({ success: true, data: entry });
    } catch (err) {
      return next(err);
    }
  }
);

router.put('/:id', async (req, res, next) => {
  try {
    const updatedEntry = await IncomeEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedEntry) return res.status(404).json({ success: false, message: 'Entry not found' });
    return res.json({ success: true, data: updatedEntry });
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await IncomeEntry.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deleted) return res.status(404).json({ success: false, message: 'Entry not found' });
    return res.json({ success: true, message: 'Entry deleted' });
  } catch (err) {
    return next(err);
  }
});

router.post('/parse-sms', [body('smsText').isString().notEmpty()], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const parsed = await localAdvisoryService.parseSMSText(req.body.smsText);
    return res.json({ success: true, data: parsed });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
