const express = require('express');
const router = express.Router();
const multer = require('multer');
const { addMaterial, getMaterials, deleteMaterial, updateMaterial } = require('../controllers/materialController');

// Multer config for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/add', upload.single('image'), addMaterial);
router.get('/list', getMaterials);
router.delete('/delete/:id', deleteMaterial);
router.put('/update/:id', upload.single('image'), updateMaterial);

module.exports = router;
