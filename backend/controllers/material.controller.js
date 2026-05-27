const Material = require('../models/material.model');
const cloudinary = require('../config/cloudinary.config');
const streamifier = require('streamifier');
const csv = require('csv-parser');
const { Readable } = require('stream');

// Helper to upload to Cloudinary from buffer
const uploadFromBuffer = (buffer) => {
    return new Promise((resolve, reject) => {
        const cld_upload_stream = cloudinary.uploader.upload_stream(
            { folder: "materials" },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        streamifier.createReadStream(buffer).pipe(cld_upload_stream);
    });
};

const addMaterial = async (req, res) => {
    try {
        const { name, dimension, description, density, embodiedEnergy, carbonFootprintFactor, fixedDimension, formType } = req.body;
        if (!req.file) return res.status(400).json({ success: false, message: 'Image is required' });

        const result = await uploadFromBuffer(req.file.buffer);
        const newMaterial = new Material({
            name, dimension, description,
            imageUrl: result.secure_url,
            imageId: result.public_id,
            density: density || 0,
            embodiedEnergy: embodiedEnergy || 0,
            fixedDimension: fixedDimension || 0,
            carbonFootprintFactor: carbonFootprintFactor || 0,
            formType: formType || 'unit'
        });
        await newMaterial.save();
        res.status(201).json({ success: true, data: newMaterial, message: 'Material added successfully' });
    } catch (error) {
        console.error('Error adding material:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getMaterials = async (req, res) => {
    try {
        const materials = await Material.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: materials });
    } catch (error) {
        console.error('Error fetching materials:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const deleteMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const material = await Material.findById(id);
        if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
        if (material.imageId) await cloudinary.uploader.destroy(material.imageId);
        await Material.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Material deleted successfully' });
    } catch (error) {
        console.error('Error deleting material:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const updateMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, dimension, description, density, embodiedEnergy, carbonFootprintFactor, fixedDimension, formType } = req.body;
        let material = await Material.findById(id);
        if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

        let imageUrl = material.imageUrl;
        let imageId = material.imageId;
        if (req.file) {
            if (material.imageId) await cloudinary.uploader.destroy(material.imageId);
            const result = await uploadFromBuffer(req.file.buffer);
            imageUrl = result.secure_url;
            imageId = result.public_id;
        }

        material.name = name || material.name;
        material.dimension = dimension || material.dimension;
        material.description = description || material.description;
        material.imageUrl = imageUrl;
        material.imageId = imageId;
        if (density !== undefined) material.density = density;
        if (embodiedEnergy !== undefined) material.embodiedEnergy = embodiedEnergy;
        if (carbonFootprintFactor !== undefined) material.carbonFootprintFactor = carbonFootprintFactor;
        if (fixedDimension !== undefined) material.fixedDimension = fixedDimension;
        if (formType !== undefined) material.formType = formType;

        await material.save();
        res.status(200).json({ success: true, data: material, message: 'Material updated successfully' });
    } catch (error) {
        console.error('Error updating material:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Bulk import from CSV
// Expected CSV headers: Name, Dimension, Description, Density, EmbodiedEnergy, CarbonFootprintFactor, FixedDimension, FormType
const bulkImportMaterials = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'CSV file is required' });

        const ft = req.file.mimetype;
        if (ft !== 'text/csv' && ft !== 'application/vnd.ms-excel') {
            return res.status(400).json({ success: false, message: 'Only CSV files are supported' });
        }

        const materialList = [];
        const failed = [];
        const stream = Readable.from(req.file.buffer.toString());

        await new Promise((resolve, reject) => {
            stream.pipe(csv())
                .on('data', (row) => {
                    if (!row.Name || !row.Name.trim()) { failed.push({ row, reason: 'Name required' }); return; }
                    materialList.push({
                        name: row.Name.trim(),
                        dimension: row.Dimension || 'unit',
                        description: row.Description || '',
                        imageUrl: 'https://placehold.co/300x200?text=No+Image',
                        imageId: '',
                        density: parseFloat(row.Density) || 0,
                        embodiedEnergy: parseFloat(row.EmbodiedEnergy) || 0,
                        carbonFootprintFactor: parseFloat(row.CarbonFootprintFactor) || 0,
                        fixedDimension: parseFloat(row.FixedDimension) || 0,
                        formType: row.FormType || 'unit',
                    });
                })
                .on('end', resolve)
                .on('error', reject);
        });

        if (materialList.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid rows found in CSV' });
        }

        const inserted = await Material.insertMany(materialList, { ordered: false }).catch(err => {
            if (err.insertedDocs) return err.insertedDocs;
            throw err;
        });

        res.status(200).json({
            success: true,
            message: `Imported ${inserted.length} material(s).`,
            count: inserted.length,
            failed: failed.length,
        });
    } catch (error) {
        console.error('Error bulk importing materials:', error);
        res.status(500).json({ success: false, message: 'Bulk import failed: ' + error.message });
    }
};

module.exports = { addMaterial, getMaterials, deleteMaterial, updateMaterial, bulkImportMaterials };
