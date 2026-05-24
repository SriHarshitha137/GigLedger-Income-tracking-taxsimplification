require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
const IncomeEntry = require('./models/IncomeEntry');
const Expense = require('./models/Expense');
const TaxSnapshot = require('./models/TaxSnapshot');

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const platformAmount = { Ola: [400, 900], Swiggy: [300, 700], Dunzo: [200, 500] };

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  await Promise.all([
    User.deleteMany({}),
    IncomeEntry.deleteMany({}),
    Expense.deleteMany({}),
    TaxSnapshot.deleteMany({})
  ]);

  const passwordHash = await bcrypt.hash('test123', 12);
  const workingSince = new Date();
  workingSince.setFullYear(workingSince.getFullYear() - 2);

  const user = await User.create({
    name: 'Ravi Kumar',
    phone: '9876543210',
    passwordHash,
    city: 'Mumbai',
    vehicleType: 'bike',
    platforms: [{ name: 'Ola' }, { name: 'Swiggy' }, { name: 'Dunzo' }],
    workingSince,
    onboardingDone: true
  });

  const incomeEntries = [];
  const platforms = ['Ola', 'Swiggy', 'Dunzo'];

  for (let daysAgo = 89; daysAgo >= 0; daysAgo -= 1) {
    if (Math.random() > 0.8) continue;

    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const entryCount = rand(1, 3);

    for (let i = 0; i < entryCount; i += 1) {
      const platform = platforms[rand(0, platforms.length - 1)];
      const [min, max] = platformAmount[platform];
      incomeEntries.push({
        userId: user._id,
        platform,
        date,
        amount: rand(min, max),
        hoursWorked: rand(2, 6),
        tips: Math.random() > 0.55 ? rand(20, 100) : 0,
        source: 'manual',
        notes: `${platform} shift`
      });
    }
  }

  const expenseEntries = [];
  for (let daysAgo = 89; daysAgo >= 0; daysAgo -= 3) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    expenseEntries.push({
      userId: user._id,
      category: 'fuel',
      amount: rand(300, 600),
      date,
      description: 'Fuel refill'
    });
  }

  for (let monthOffset = 0; monthOffset < 3; monthOffset += 1) {
    const rechargeDate = new Date();
    rechargeDate.setMonth(rechargeDate.getMonth() - monthOffset, 6);
    expenseEntries.push({
      userId: user._id,
      category: 'phone_recharge',
      amount: 299,
      date: rechargeDate,
      description: 'Monthly data recharge'
    });

    const emiDate = new Date();
    emiDate.setMonth(emiDate.getMonth() - monthOffset, 10);
    expenseEntries.push({
      userId: user._id,
      category: 'vehicle_emi',
      amount: 3500,
      date: emiDate,
      description: 'Bike EMI'
    });
  }

  for (let i = 0; i < 4; i += 1) {
    const date = new Date();
    date.setDate(date.getDate() - rand(5, 85));
    expenseEntries.push({
      userId: user._id,
      category: 'vehicle_repair',
      amount: rand(500, 2000),
      date,
      description: 'Vehicle maintenance'
    });
  }

  await IncomeEntry.insertMany(incomeEntries);
  await Expense.insertMany(expenseEntries);

  const totalIncome = incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpenses = expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);

  console.log(`Seed complete for ${user.name}`);
  console.log(`Income entries created: ${incomeEntries.length}`);
  console.log(`Expense entries created: ${expenseEntries.length}`);
  console.log(`Total income: Rs. ${totalIncome.toLocaleString('en-IN')}`);
  console.log(`Total expenses: Rs. ${totalExpenses.toLocaleString('en-IN')}`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
