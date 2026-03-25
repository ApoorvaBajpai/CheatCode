const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
connectDB();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/contests', require('./routes/contests'));
app.use('/api/run', require('./routes/run'));
app.use('/api/submissions', require('./routes/submissions'));

app.get('/', (_, res) => res.send('CheatCode API'));
app.listen(process.env.PORT || 5000, () => console.log('Server running on 5000'));
