var express = require('express');
var router = express.Router();
var Perfume = require('../models/Perfume');
var Brand = require('../models/Brand');
var { requireAuth } = require('../middleware/auth');

//Home - Return JSON API info
router.get('/', async function(req, res, next) {
  res.json({
    success: true,
    message: 'Perfume World REST API',
    version: '1.0.0',
    docs: '/api-docs',
    endpoints: {
      perfumes: '/perfumes',
      perfumeDetail: '/perfumes/:id',
      brands: '/api/brands',
      auth: '/auth'
    }
  });
});

// GET all perfumes (public API)
router.get('/perfumes', async function(req, res, next) {
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
    res.json({
      success: true,
      data: {
        perfumes,
        brands,
        filters: { q, brand }
      }
    });
  } catch (err) {
    next(err);
  }
});

// Perfume detail - Return JSON
router.get('/perfumes/:id', async (req, res, next) => {
  try {
    const perfume = await Perfume.findById(req.params.id)
      .populate('brand', 'brandName')
      .populate('comments.author', 'name email')
      .lean();
    if (!perfume) {
      return res.status(404).json({ success: false, message: 'Perfume not found' });
    }
    // current user's comment if exists
    let myComment = null;
    if (req.user && perfume.comments) {
      myComment = perfume.comments.find((c) => String(c.author?._id || c.author) === req.user._id);
    }
    res.json({
      success: true,
      data: {
        perfume,
        myComment,
        isAuthenticated: !!req.user
      }
    });
  } catch (err) {
    next(err);
  }
});

// Add or update comment (once per user) - Return JSON
router.post('/perfumes/:id/comments', requireAuth, async (req, res, next) => {
  try {
    const { rating, content } = req.body;
    const perfume = await Perfume.findById(req.params.id);
    if (!perfume) {
      return res.status(404).json({ success: false, message: 'Perfume not found' });
    }
    const idx = perfume.comments.findIndex((c) => String(c.author) === req.user._id);
    if (idx >= 0) {
      perfume.comments[idx].rating = Number(rating);
      perfume.comments[idx].content = content;
    } else {
      perfume.comments.push({ rating: Number(rating), content, author: req.user._id });
    }
    await perfume.save();
    
    const updated = await Perfume.findById(req.params.id)
      .populate('brand', 'brandName')
      .populate('comments.author', 'name email')
      .lean();
    
    res.json({
      success: true,
      message: idx >= 0 ? 'Comment updated' : 'Comment added',
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

// Delete own comment - Return JSON
router.delete('/perfumes/:id/comments', requireAuth, async (req, res, next) => {
  try {
    const perfume = await Perfume.findById(req.params.id);
    if (!perfume) {
      return res.status(404).json({ success: false, message: 'Perfume not found' });
    }
    perfume.comments = perfume.comments.filter((c) => String(c.author) !== req.user._id);
    await perfume.save();
    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
