var express = require('express');
var router = express.Router();
var Members = require('../../models/Member');
var { requireAdmin } = require('../../middleware/auth');

/**
 * @swagger
 * /api/members:
 *   get:
 *     summary: Get all members (Admin only)
 *     tags: [Admin - Members]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all members
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Member'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const members = await Members.find().select('-password').lean();
    res.json({ success: true, data: members });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
