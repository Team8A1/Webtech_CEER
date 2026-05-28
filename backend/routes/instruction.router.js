const express = require('express');
const router = express.Router();
const { getInstruction, updateInstruction, getLatestUpdateTime } = require('../controllers/instruction.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/latest/update-time', getLatestUpdateTime);
router.get('/:title', getInstruction);
router.put('/:title', protect, updateInstruction);

module.exports = router;
