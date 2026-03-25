// Run: node check.js
// Shows exact error without starting the server

process.on('uncaughtException', e => {
    console.error('\n💥 CRASH REASON:', e.message);
    if (e.code === 'MODULE_NOT_FOUND') {
        console.error('   → Missing package. Run: npm install', e.requireStack?.[0]);
    }
    process.exit(1);
});

require('dotenv').config();

const checks = {
    'MONGODB_URI': process.env.MONGODB_URI,
    'JWT_SECRET': process.env.JWT_SECRET,
};

let failed = false;
for (const [k, v] of Object.entries(checks)) {
    if (!v) { console.error(`❌ .env missing: ${k}`); failed = true; }
    else console.log(`✅ ${k} is set`);
}

if (failed) {
    console.error('\nFix your .env file then restart.\n');
    process.exit(1);
}

// Try loading each route to catch require() errors
const routes = ['./routes/auth', './routes/contests', './routes/run', './routes/submissions'];
for (const r of routes) {
    try { require(r); console.log(`✅ ${r}`); }
    catch (e) { console.error(`❌ ${r} →`, e.message); }
}

console.log('\n✅ All checks passed. Starting server...\n');
require('./index.js');
