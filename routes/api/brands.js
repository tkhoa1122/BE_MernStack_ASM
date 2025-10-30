var express = require('express');
var router = express.Router();
var Brand = require('../../models/Brand');
var { requireAdmin } = require('../../middleware/auth');
var { checkBrandBeforeDelete } = require('../../middleware/cascadeCheck');

// Admin-only: all methods including GET
router.use(requireAdmin);

/**
 * @swagger
 * /api/brands:
 *   get:
 *     summary: Get all brands
 *     tags: [Brands]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all brands
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Brand'
 *       401:
 *         description: Unauthorized - Admin only
 *       403:
 *         description: Forbidden - Admin privileges required
 */
// GET all brands
router.get('/', async (req, res, next) => {
  try {
    const brands = await Brand.find().lean();
    res.json(brands);
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/brands:
 *   post:
 *     summary: Create a new brand
 *     tags: [Brands]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - brandName
 *             properties:
 *               brandName:
 *                 type: string
 *                 example: Dior
 *     responses:
 *       201:
 *         description: Brand created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Bad request - Invalid data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
// Create brand
router.post('/', async (req, res, next) => {
  try {
    const brand = await Brand.create({ brandName: req.body.brandName });
    res.status(201).json(brand);
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/brands/{brandId}:
 *   get:
 *     summary: Get brand by ID
 *     tags: [Brands]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Brand details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       404:
 *         description: Brand not found
 *       401:
 *         description: Unauthorized
 */
// Get brand by id
router.get('/:brandId', async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.brandId).lean();
    if (!brand) return res.status(404).json({ message: 'Not found' });
    res.json(brand);
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/brands/{brandId}:
 *   put:
 *     summary: Update brand
 *     tags: [Brands]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brandName:
 *                 type: string
 *                 example: Dior
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       404:
 *         description: Brand not found
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /api/brands/{brandId}:
 *   delete:
 *     summary: Delete brand
 *     description: Delete a brand. Will fail if brand is used by any perfume.
 *     tags: [Brands]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Brand deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Xóa thương hiệu thành công
 *       400:
 *         description: Cannot delete - Brand is in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Brand not found
 *       401:
 *         description: Unauthorized
 */
// Delete brand
router.delete('/:brandId', checkBrandBeforeDelete, async (req, res, next) => {
  try {
    await Brand.findByIdAndDelete(req.params.brandId);
    res.json({ ok: true, message: 'Xóa thương hiệu thành công' });
  } catch (err) { next(err); }
});

module.exports = router;
