const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Register route
router.get('/register', (req, res) => {
  res.render('auth/register');
});

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if(user) return res.render('auth/register', { error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    req.session.user = { id: user._id, name: user.name, role: user.role };
    res.redirect('/dashboard');
  } catch(err) {
    console.error(err);
    res.render('auth/register', { error: 'Something went wrong' });
  }
});

// Login route
router.get('/login', (req, res) => {
  res.render('auth/login');
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if(!user) return res.render('auth/login', { error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.render('auth/login', { error: 'Invalid credentials' });

    req.session.user = { id: user._id, name: user.name, role: user.role };
    res.redirect('/dashboard');
  } catch(err) {
    console.error(err);
    res.render('auth/login', { error: 'Something went wrong' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
