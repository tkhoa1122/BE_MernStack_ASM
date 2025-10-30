var express = require('express');
var router = express.Router();
var Members = require('../models/Member');
var { signToken, requireAuth } = require('../middleware/auth');

// Register
router.get('/register', (req, res) => {
  if (req.user) return res.redirect('/');
  res.render('register', { title: 'Register' });
});

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, YOB, gender } = req.body;
    const exists = await Members.findOne({ email });
    if (exists) return res.status(400).render('register', { title: 'Register', error: 'Email already registered' });
    
    // Xử lý gender: chuyển string thành boolean hoặc undefined
    let genderValue;
    if (gender === 'true') {
      genderValue = true;
    } else if (gender === 'false') {
      genderValue = false;
    } else {
      genderValue = undefined;
    }
    
    console.log('Register Gender:', gender, '-> Converted:', genderValue);
    const member = new Members({ email, password, name, YOB, gender: genderValue, isAdmin: false });
    await member.save();
    const token = signToken(member);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

// Login
router.get('/login', (req, res) => {
  if (req.user) return res.redirect('/');
  res.render('login', { title: 'Login' });
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await Members.findOne({ email });
    if (!user) return res.status(400).render('login', { title: 'Login', error: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).render('login', { title: 'Login', error: 'Invalid credentials' });
    const token = signToken(user);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.redirect('/');
  } catch (err) {
    next(err);
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  if (req.accepts('html')) return res.redirect('/');
  res.json({ message: 'Logged out' });
});

// Current user page
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await Members.findById(req.user._id).lean();
    console.log('User data:', user); // Debug log
    res.render('profile', { title: 'Your Profile', user });
  } catch (err) {
    next(err);
  }
});

// Update current user profile
router.post('/me', requireAuth, async (req, res, next) => {
  try {
    const { name, YOB, gender } = req.body;
    
    // Xử lý gender: chuyển string thành boolean hoặc undefined
    let genderValue;
    if (gender === 'true') {
      genderValue = true;
    } else if (gender === 'false') {
      genderValue = false;
    } else {
      genderValue = undefined;
    }
    
    await Members.findByIdAndUpdate(req.user._id, { name, YOB, gender: genderValue });
    res.redirect('/me');
  } catch (err) {
    next(err);
  }
});

// Change password
router.post('/me/password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await Members.findById(req.user._id);
    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(400).render('profile', { title: 'Your Profile', user: req.user, error: 'Current password incorrect' });
    user.password = newPassword;
    await user.save();
    res.redirect('/me');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
// Development helper to promote the first admin (disabled by default)
if (process.env.ALLOW_SELF_ADMIN_SEED === 'true') {
  router.post('/make-me-admin', requireAuth, async (req, res, next) => {
    try {
      const Members = require('../models/Member');
      const anyAdmin = await Members.exists({ isAdmin: true });
      if (anyAdmin) return res.status(400).json({ message: 'Admin already exists' });
      await Members.findByIdAndUpdate(req.user._id, { isAdmin: true });
      res.json({ ok: true, message: 'You are now admin' });
    } catch (err) { next(err); }
  });
}
