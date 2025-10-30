var express = require('express');
var router = express.Router();
var Perfume = require('../../models/Perfume');
var { requireAdmin } = require('../../middleware/auth');
var { checkPerfumeBeforeDelete } = require('../../middleware/cascadeCheck');

// Admin-only: all methods including GET for this API namespace
router.use(requireAdmin);

// GET all perfumes (admin)
router.get('/', async (req, res, next) => {
  try {
    const perfumes = await Perfume.find().populate('brand', 'brandName').lean();
    res.json(perfumes);
  } catch (err) { next(err); }
});

// Create perfume
router.post('/', async (req, res, next) => {
  try {
    const perfume = await Perfume.create(req.body);
    res.status(201).json(perfume);
  } catch (err) { next(err); }
});

// Get perfume by id
router.get('/:perfumeId', async (req, res, next) => {
  try {
    const perfume = await Perfume.findById(req.params.perfumeId).populate('brand', 'brandName').lean();
    if (!perfume) return res.status(404).json({ message: 'Not found' });
    res.json(perfume);
  } catch (err) { next(err); }
});

// Update perfume
router.put('/:perfumeId', async (req, res, next) => {
  try {
    const perfume = await Perfume.findByIdAndUpdate(req.params.perfumeId, req.body, { new: true }).lean();
    if (!perfume) return res.status(404).json({ message: 'Not found' });
    res.json(perfume);
  } catch (err) { next(err); }
});

// Delete perfume
router.delete('/:perfumeId', checkPerfumeBeforeDelete, async (req, res, next) => {
  try {
    await Perfume.findByIdAndDelete(req.params.perfumeId);
    res.json({ ok: true, message: 'Xóa sản phẩm thành công' });
  } catch (err) { next(err); }
});

module.exports = router;
