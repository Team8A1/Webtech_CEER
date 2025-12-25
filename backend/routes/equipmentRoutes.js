const express = require('express');
const router = express.Router();
const multer = require('multer');
const { addEquipment, getEquipments, deleteEquipment } = require('../controllers/equipmentController');

// Multer config for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/add', upload.single('image'), addEquipment);
router.get('/list', getEquipments);
router.delete('/delete/:id', deleteEquipment);

module.exports = router;
