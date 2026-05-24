
require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const incomeRoutes = require('./routes/income');
const expensesRoutes = require('./routes/expenses');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes = require('./routes/ai');
const pdfRoutes = require('./routes/pdf');
const { protect } = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');
const app = express();
const PORT = process.env.PORT || 5000;
app.use(
  cors({
    origin: process.env.CLIENT_URL ,
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
app.get('/health', (req, res) => res.json({ success: true, message: 'GigLedger API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api/income', protect, incomeRoutes);
app.use('/api/expenses', protect, expensesRoutes);
app.use('/api/analytics', protect, analyticsRoutes);
app.use('/api/ai', protect, aiRoutes);
app.use('/api/pdf', protect, pdfRoutes);
app.use(errorHandler);

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('MongoDB connected');
//     app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
//   })
//   .catch((err) => {
//     console.error('MongoDB connection error:', err.message);
//     process.exit(1);
//   });
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server running on port ${PORT}`);
// });
// const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });

  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });



