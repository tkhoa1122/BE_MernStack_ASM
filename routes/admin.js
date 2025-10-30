var express = require('express');
var router = express.Router();
var { requireAdmin } = require('../middleware/auth');
var { checkBrandBeforeDelete, checkPerfumeBeforeDelete } = require('../middleware/cascadeCheck');
var Brand = require('../models/Brand');
var Perfume = require('../models/Perfume');
var Member = require('../models/Member');

// Admin dashboard (UI only)
router.get('/', requireAdmin, async function (req, res, next) {
  try {
    const [brands, perfumes, memberCount] = await Promise.all([
      Brand.find().lean(),
      Perfume.find().populate('brand', 'brandName').lean(),
      Member.countDocuments()
    ]);
    console.log('Dashboard Brands:', brands.length);
    console.log('Dashboard Perfumes:', perfumes.length);
    console.log('Dashboard Members:', memberCount);
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      brands,
      perfumes,
      memberCount
    });
  } catch (err) {
    next(err);
  }
});

//Brand
router.get('/brands', requireAdmin, async (req, res, next) => {
  try {
    const brands = await Brand.find().lean();
    res.render('admin/brands', { title: 'Manage Brands', brands });
  } catch (err) { next(err); }
});

// Create brand
router.post('/brands', requireAdmin, async (req, res, next) => {
  try {
    if (req.body.brandName && req.body.brandName.trim()) {
      await Brand.create({ brandName: req.body.brandName.trim() });
    }
    res.redirect('/dashboard');
  } catch (err) { next(err); }
});

// Update brand
router.post('/brands/:brandId', requireAdmin, async (req, res, next) => {
  try {
    await Brand.findByIdAndUpdate(req.params.brandId, { brandName: req.body.brandName });
    res.redirect('/dashboard');
  } catch (err) { next(err); }
});

// Delete brand
router.post('/brands/:brandId/delete', requireAdmin, checkBrandBeforeDelete, async (req, res, next) => {
  try {
    await Brand.findByIdAndDelete(req.params.brandId);
    res.redirect('/dashboard/brands');
  } catch (err) { next(err); }
});

// Perfumes
// List perfumes
router.get('/perfumes', requireAdmin, async (req, res, next) => {
  try {
    const perfumes = await Perfume.find().populate('brand', 'brandName').lean();
    res.render('admin/perfumes', { title: 'Manage Perfumes', perfumes });
  } catch (err) { next(err); }
});

// New perfume form
router.get('/perfumes/new', requireAdmin, async (req, res, next) => {
  try {
    const brands = await Brand.find().lean();
    res.render('admin/perfume-form', { title: 'Create Perfume', brands, perfume: null, action: '/dashboard/perfumes' });
  } catch (err) { next(err); }
});

// Create perfume
router.post('/perfumes', requireAdmin, async (req, res, next) => {
  try {
    const body = req.body;
    await Perfume.create({
      perfumeName: body.perfumeName,
      uri: body.uri,
      price: Number(body.price),
      concentration: body.concentration,
      description: body.description,
      ingredients: body.ingredients,
      volume: Number(body.volume),
      targetAudience: body.targetAudience,
      brand: body.brand,
    });
    res.redirect('/dashboard');
  } catch (err) { next(err); }
});

// Edit perfume form
router.get('/perfumes/:id/edit', requireAdmin, async (req, res, next) => {
  try {
    const [perfume, brands] = await Promise.all([
      Perfume.findById(req.params.id).lean(),
      Brand.find().lean(),
    ]);
    if (!perfume) return res.redirect('/dashboard/perfumes');
    res.render('admin/perfume-form', { title: 'Edit Perfume', brands, perfume, action: `/dashboard/perfumes/${perfume._id}` });
  } catch (err) { next(err); }
});

// Update perfume
router.post('/perfumes/:id', requireAdmin, async (req, res, next) => {
  try {
    const body = req.body;
    await Perfume.findByIdAndUpdate(req.params.id, {
      perfumeName: body.perfumeName,
      uri: body.uri,
      price: Number(body.price),
      concentration: body.concentration,
      description: body.description,
      ingredients: body.ingredients,
      volume: Number(body.volume),
      targetAudience: body.targetAudience,
      brand: body.brand,
    });
    res.redirect('/dashboard');
  } catch (err) { next(err); }
});

// Delete perfume
router.post('/perfumes/:id/delete', requireAdmin, checkPerfumeBeforeDelete, async (req, res, next) => {
  try {
    await Perfume.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard/perfumes');
  } catch (err) { next(err); }
});

module.exports = router;
