/**
 * Run this: node diagnose.js
 * It will tell you exactly what is broken.
 */
require('dotenv').config();

console.log('\n=== CheatCode Backend Diagnostics ===\n');

// 1. Check packages
const packages = ['express', 'cors', 'mongoose', 'bcryptjs', 'jsonwebtoken', 'axios', 'dotenv'];
packages.forEach(pkg => {
    try { require(pkg); console.log(`✅ ${pkg}`); }
    catch { console.log(`❌ ${pkg} - NOT INSTALLED → run: npm install ${pkg}`); }
});

// 2. Check .env values
console.log('\n--- .env file ---');
const vars = { MONGODB_URI: process.env.MONGODB_URI, JWT_SECRET: process.env.JWT_SECRET, JUDGE0_KEY: process.env.JUDGE0_KEY };
for (const [k, v] of Object.entries(vars)) {
    if (!v) console.log(`❌ ${k}: MISSING`);
    else console.log(`✅ ${k}: ${v.slice(0, 20)}...`);
}

// 3. Try connecting to MongoDB
if (process.env.MONGODB_URI) {
    const mongoose = require('mongoose');
    console.log('\n--- MongoDB ---');
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => { console.log('✅ MongoDB connected'); process.exit(0); })
        .catch(e => { console.log('❌ MongoDB failed:', e.message); process.exit(1); });
} else {
    console.log('\n❌ Skipping MongoDB test — MONGODB_URI missing');
    process.exit(1);
}
