const bcrypt = require('bcryptjs');
const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (user) => ({ _id: user._id, name: user.name, phone: user.phone, onboardingDone: user.onboardingDone });

router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .bail()
      .isLength({ min: 6 })
      .withMessage('Name must be at least 6 characters'),
    body('phone')
      .trim()
      .notEmpty()
      .withMessage('Phone is required')
      .bail()
      .matches(/^[0-9]{10}$/)
      .withMessage('Phone must be exactly 10 digits'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .bail()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .bail()
      .matches(/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]`;']/)
      .withMessage('Password must include at least one special character')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const { name, phone, email, password } = req.body;
      const existing = await User.findByPhone(phone);
      if (existing) return res.status(400).json({ success: false, message: 'Phone already registered' });

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({ name, phone, email, passwordHash });
      const token = signToken(user._id);

      return res.status(201).json({ success: true, token, user: publicUser(user) });
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  '/login',
  [
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const { phone, password } = req.body;
      const user = await User.findByPhone(phone);
      if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

      const matches = await user.comparePassword(password);
      if (!matches) return res.status(400).json({ success: false, message: 'Invalid credentials' });

      return res.status(200).json({ success: true, token: signToken(user._id), user: publicUser(user) });
    } catch (err) {
      return next(err);
    }
  }
);

router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    return res.status(200).json({ success: true, user });
  } catch (err) {
    return next(err);
  }
});

router.patch('/onboarding', protect, async (req, res, next) => {
  try {
    const { platforms, vehicleType, city, workingSince } = req.body;
    const errors = [];
    const allowedVehicles = ['bike', 'car', 'bicycle', 'none'];

    if (!Array.isArray(platforms) || platforms.length === 0) errors.push({ path: 'platforms', msg: 'Select at least one platform' });
    if (!vehicleType || !allowedVehicles.includes(vehicleType)) errors.push({ path: 'vehicleType', msg: 'Vehicle type is required' });
    if (!city || !String(city).trim()) errors.push({ path: 'city', msg: 'City is required' });
    if (!workingSince || Number.isNaN(new Date(workingSince).getTime())) errors.push({ path: 'workingSince', msg: 'Working since date is required' });
    if (errors.length) return res.status(400).json({ success: false, message: 'All fields are required', errors });

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        platforms: platforms.map((platform) => ({ name: String(platform.name || platform).trim() })).filter((platform) => platform.name),
        vehicleType,
        city: String(city).trim(),
        workingSince,
        onboardingDone: true
      },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    return res.status(200).json({ success: true, user });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
