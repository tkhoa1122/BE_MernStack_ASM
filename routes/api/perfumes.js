var express = require('express');
var router = express.Router();
var Perfume = require('../../models/Perfume');
var { requireAdmin } = require('../../middleware/auth');
var { checkPerfumeBeforeDelete } = require('../../middleware/cascadeCheck');

// Admin-only: all methods including GET for this API namespace
router.use(requireAdmin);

/**
 * @swagger
 * /api/perfumes:
 *   get:
 *     summary: Get all perfumes (Admin only)
 *     tags: [Perfumes]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all perfumes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Perfume'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
// GET all perfumes (admin)
router.get('/', async (req, res, next) => {
  try {
    const perfumes = await Perfume.find().populate('brand', 'brandName').lean();
    res.json(perfumes);
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/perfumes:
 *   post:
 *     summary: Create a new perfume
 *     tags: [Perfumes]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - perfumeName
 *               - uri
 *               - price
 *               - concentration
 *               - description
 *               - ingredients
 *               - volume
 *               - targetAudience
 *               - brand
 *             properties:
 *               perfumeName:
 *                 type: string
 *                 example: Sauvage
 *               uri:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *               price:
 *                 type: number
 *                 example: 120
 *               concentration:
 *                 type: string
 *                 example: EDP
 *               description:
 *                 type: string
 *                 example: A fresh and spicy fragrance
 *               ingredients:
 *                 type: string
 *                 example: Bergamot, Pepper, Ambroxan
 *               volume:
 *                 type: number
 *                 example: 100
 *               targetAudience:
 *                 type: string
 *                 example: male
 *               brand:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       201:
 *         description: Perfume created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Perfume'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
// Create perfume
router.post('/', async (req, res, next) => {
  try {
    const perfume = await Perfume.create(req.body);
    res.status(201).json(perfume);
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/perfumes/{perfumeId}:
 *   get:
 *     summary: Get perfume by ID
 *     tags: [Perfumes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: perfumeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Perfume ID
 *     responses:
 *       200:
 *         description: Perfume details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Perfume'
 *       404:
 *         description: Perfume not found
 *       401:
 *         description: Unauthorized
 */
// Get perfume by id
router.get('/:perfumeId', async (req, res, next) => {
  try {
    const perfume = await Perfume.findById(req.params.perfumeId).populate('brand', 'brandName').lean();
    if (!perfume) return res.status(404).json({ message: 'Not found' });
    res.json(perfume);
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/perfumes/{perfumeId}:
 *   put:
 *     summary: Update perfume
 *     tags: [Perfumes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: perfumeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Perfume ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Perfume'
 *     responses:
 *       200:
 *         description: Perfume updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Perfume'
 *       404:
 *         description: Perfume not found
 *       401:
 *         description: Unauthorized
 */
// Update perfume
router.put('/:perfumeId', async (req, res, next) => {
  try {
    const perfume = await Perfume.findByIdAndUpdate(req.params.perfumeId, req.body, { new: true }).lean();
    if (!perfume) return res.status(404).json({ message: 'Not found' });
    res.json(perfume);
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/perfumes/{perfumeId}:
 *   delete:
 *     summary: Delete perfume
 *     tags: [Perfumes]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: perfumeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Perfume ID
 *     responses:
 *       200:
 *         description: Perfume deleted successfully
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
 *                   example: Xóa sản phẩm thành công
 *       404:
 *         description: Perfume not found
 *       401:
 *         description: Unauthorized
 */
// Delete perfume
router.delete('/:perfumeId', checkPerfumeBeforeDelete, async (req, res, next) => {
  try {
    await Perfume.findByIdAndDelete(req.params.perfumeId);
    res.json({ ok: true, message: 'Xóa sản phẩm thành công' });
  } catch (err) { next(err); }
});

module.exports = router;
