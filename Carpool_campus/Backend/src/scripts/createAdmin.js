// Usage: npm run seed:admin -- "Admin Name" admin@campus.edu "StrongPass123!"
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

async function main() {
  const [name, email, password] = process.argv.slice(2);
  if (!name || !email || !password) {
    console.error('Usage: npm run seed:admin -- "Admin Name" admin@campus.edu "StrongPass123!"');
    process.exit(1);
  }

  await connectDB();

  let user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    if (!user.roles.includes('admin')) user.roles.push('admin');
    user.verified = true;
    await user.save();
    console.log(`Existing user ${email} granted admin role.`);
  } else {
    user = await User.create({ name, email, password, roles: ['admin'], verified: true });
    console.log(`Admin user created: ${email}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
