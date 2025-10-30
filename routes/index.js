var express = require('express');
var router = express.Router();
var Perfume = require('../models/Perfume');
var Brand = require('../models/Brand');
var { requireAuth } = require('../middleware/auth');

//Home
router.get('/', async function(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    const brand = (req.query.brand || '').trim();
    const filter = {};
    if (q) filter.perfumeName = { $regex: q, $options: 'i' };
    if (brand) filter.brand = brand;
    const [perfumes, brands] = await Promise.all([
      Perfume.find(filter).populate('brand', 'brandName').lean(),
      Brand.find().lean(),
    ]);
    res.render('index', { title: 'Perfumes', perfumes, brands, q, brand });
  } catch (err) {
    next(err);
  }
});

// Perfume detail
router.get('/perfumes/:id', async (req, res, next) => {
  try {
    const perfume = await Perfume.findById(req.params.id)
      .populate('brand', 'brandName')
      .populate('comments.author', 'name email')
      .lean();
    if (!perfume) return next();
    // current user's comment if exists
    let myComment = null;
    if (req.user && perfume.comments) {
      myComment = perfume.comments.find((c) => String(c.author?._id || c.author) === req.user._id);
    }
    res.render('perfume-detail', { title: perfume.perfumeName, perfume, myComment });
  } catch (err) {
    next(err);
  }
});

// Add or update comment (once per user)
router.post('/perfumes/:id/comments', requireAuth, async (req, res, next) => {
  try {
    const { rating, content } = req.body;
    const perfume = await Perfume.findById(req.params.id);
    if (!perfume) return next();
    const idx = perfume.comments.findIndex((c) => String(c.author) === req.user._id);
    if (idx >= 0) {
      perfume.comments[idx].rating = Number(rating);
      perfume.comments[idx].content = content;
    } else {
      perfume.comments.push({ rating: Number(rating), content, author: req.user._id });
    }
    await perfume.save();
    res.redirect(`/perfumes/${req.params.id}`);
  } catch (err) {
    next(err);
  }
});

// Delete own comment
router.post('/perfumes/:id/comments/delete', requireAuth, async (req, res, next) => {
  try {
    const perfume = await Perfume.findById(req.params.id);
    if (!perfume) return next();
    perfume.comments = perfume.comments.filter((c) => String(c.author) !== req.user._id);
    await perfume.save();
    res.redirect(`/perfumes/${req.params.id}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
