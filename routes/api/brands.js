var express = require('express');
var router = express.Router();
var Brand = require('../../models/Brand');
var { requireAdmin } = require('../../middleware/auth');
var { checkBrandBeforeDelete } = require('../../middleware/cascadeCheck');

// Admin-only: all methods including GET
router.use(requireAdmin);

// GET all brands
router.get('/', async (req, res, next) => {
  try {
    const brands = await Brand.find().lean();
    res.json(brands);
  } catch (err) { next(err); }
});

// Create brand
router.post('/', async (req, res, next) => {
  try {
    const brand = await Brand.create({ brandName: req.body.brandName });
    res.status(201).json(brand);
  } catch (err) { next(err); }
});

// Get brand by id
router.get('/:brandId', async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.brandId).lean();
    if (!brand) return res.status(404).json({ message: 'Not found' });
    res.json(brand);
  } catch (err) { next(err); }
});

// Update brand
router.put('/:brandId', async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndUpdate(
      req.params.brandId,
      { brandName: req.body.brandName },
      { new: true }
    ).lean();
    if (!brand) return res.status(404).json({ message: 'Not found' });
    res.json(brand);
  } catch (err) { next(err); }
});

// Delete brand
router.delete('/:brandId', checkBrandBeforeDelete, async (req, res, next) => {
  try {
    await Brand.findByIdAndDelete(req.params.brandId);
    res.json({ ok: true, message: 'Xóa thương hiệu thành công' });
  } catch (err) { next(err); }
});

module.exports = router;
