var express = require('express');
var router = express.Router();
var Members = require('../models/Member');
var { requireAdmin } = require('../middleware/auth');

// /collectors - admin only list of members
router.get('/collectors', requireAdmin, async (req, res, next) => {
  try {
    const members = await Members.find().select('-password').lean();
    // render or json depending on accept
    if (req.accepts('html')) return res.render('collectors', { title: 'Collectors', members });
    res.json(members);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
