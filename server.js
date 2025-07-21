const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const chatRoutes = require('./routes/chat');
const { ensureAuth, ensureGuest } = require('./middleware/authMiddleware');
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost/sevaconnect', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Session (for flash messages or simple login sessions)
app.use(session({
  secret: 'secretsessionkey',
  resave: false,
  saveUninitialized: true,
}));

// Routes
app.use('/auth', authRoutes);
app.use('/jobs', jobRoutes);
app.use('/chat', chatRoutes);

// Home route
app.get('/', ensureGuest, (req, res) => {
  res.render('index', { user: null });
});

// Dashboard (for logged in users)
app.get('/dashboard', ensureAuth, (req, res) => {
  res.render('dashboard', { user: req.session.user });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
