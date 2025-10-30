var express = require('express');
var router = express.Router();
var Members = require('../models/Member');
var { signToken, requireAuth } = require('../middleware/auth');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               name:
 *                 type: string
 *                 example: John Doe
 *               YOB:
 *                 type: integer
 *                 example: 1990
 *               gender:
 *                 type: string
 *                 enum: ['true', 'false', '']
 *                 example: 'true'
 *     responses:
 *       200:
 *         description: Registration successful, JWT cookie set
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=abcde12345; Path=/; HttpOnly
 *       400:
 *         description: Email already registered
 */
// Register API - No GET route needed
router.post('/auth/register', async (req, res, next) => {
  try {
    const { email, password, name, YOB, gender } = req.body;
    const exists = await Members.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    // Xử lý gender: chuyển string thành boolean hoặc undefined
    let genderValue;
    if (gender === 'true') {
      genderValue = true;
    } else if (gender === 'false') {
      genderValue = false;
    } else {
      genderValue = undefined;
    }
    
    const member = new Members({ email, password, name, YOB, gender: genderValue, isAdmin: false });
    await member.save();
    const token = signToken(member);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: member._id,
        email: member.email,
        name: member.name,
        isAdmin: member.isAdmin
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful, JWT cookie set
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=abcde12345; Path=/; HttpOnly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/Member'
 *       400:
 *         description: Invalid credentials
 */
router.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await Members.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    const token = signToken(user);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Member'
 *       401:
 *         description: Unauthorized
 */
router.get('/auth/me', requireAuth, async (req, res, next) => {
  try {
    const user = await Members.findById(req.user._id).lean();
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /auth/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               YOB:
 *                 type: number
 *               gender:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Unauthorized
 */
router.put('/auth/me', requireAuth, async (req, res, next) => {
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
    
    const updatedUser = await Members.findByIdAndUpdate(
      req.user._id, 
      { name, YOB, gender: genderValue },
      { new: true }
    ).lean();
    res.json({ success: true, message: 'Profile updated', data: updatedUser });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /auth/me/password:
 *   post:
 *     summary: Change password
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password changed
 *       400:
 *         description: Current password incorrect
 *       401:
 *         description: Unauthorized
 */
router.post('/auth/me/password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await Members.findById(req.user._id);
    const ok = await user.comparePassword(currentPassword);
    if (!ok) {
      return res.status(400).json({ success: false, message: 'Current password incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
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
