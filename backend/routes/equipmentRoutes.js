const express = require('express');
const router = express.Router();
const multer = require('multer');
const { addEquipment, getEquipments, deleteEquipment, updateEquipment } = require('../controllers/equipmentController');

// Multer config for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/add', upload.single('image'), addEquipment);
router.post('/import', upload.single('file'), require('../controllers/equipmentController').bulkImportEquipment);
router.put('/update/:id', upload.single('image'), updateEquipment);
router.get('/list', getEquipments);
router.delete('/delete/:id', deleteEquipment);

module.exports = router;
