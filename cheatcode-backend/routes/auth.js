const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password)
            return res.status(400).json({ message: 'All fields required' });

        const user = await User.create({ username, email, password });
        res.status(201).json({ token: sign(user._id), username: user.username });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ message: 'Username or email taken' });
        res.status(500).json({ message: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password)))
            return res.status(401).json({ message: 'Invalid credentials' });

        res.json({ token: sign(user._id), username: user.username });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
