const Material = require('../models/Material');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Helper to upload to Cloudinary from buffer
const uploadFromBuffer = (buffer) => {
    return new Promise((resolve, reject) => {
        const cld_upload_stream = cloudinary.uploader.upload_stream(
            {
                folder: "materials"
            },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(buffer).pipe(cld_upload_stream);
    });
};

const addMaterial = async (req, res) => {
    try {
        const { name, dimension, description } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Image is required' });
        }

        const result = await uploadFromBuffer(req.file.buffer);

        const newMaterial = new Material({
            name,
            dimension,
            description,
            imageUrl: result.secure_url,
            imageId: result.public_id
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

        if (!material) {
            return res.status(404).json({ success: false, message: 'Material not found' });
        }

        // Delete image from Cloudinary
        await cloudinary.uploader.destroy(material.imageId);

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
        const { name, dimension, description } = req.body;

        let material = await Material.findById(id);
        if (!material) {
            return res.status(404).json({ success: false, message: 'Material not found' });
        }

        let imageUrl = material.imageUrl;
        let imageId = material.imageId;

        // If new image is uploaded
        if (req.file) {
            // Delete old image
            await cloudinary.uploader.destroy(material.imageId);
            // Upload new image
            const result = await uploadFromBuffer(req.file.buffer);
            imageUrl = result.secure_url;
            imageId = result.public_id;
        }

        material.name = name || material.name;
        material.dimension = dimension || material.dimension;
        material.description = description || material.description;
        material.imageUrl = imageUrl;
        material.imageId = imageId;

        await material.save();

        res.status(200).json({ success: true, data: material, message: 'Material updated successfully' });
    } catch (error) {
        console.error('Error updating material:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    addMaterial,
    getMaterials,
    deleteMaterial,
    updateMaterial
};
