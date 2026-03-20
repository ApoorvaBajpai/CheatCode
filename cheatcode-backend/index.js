const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const contestRoutes = require('./routes/contests');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/contests', contestRoutes);

app.get('/', (req, res) => res.send('CheatCode API running'));

app.listen(PORT, () => console.log(`Server on port ${PORT}`));
