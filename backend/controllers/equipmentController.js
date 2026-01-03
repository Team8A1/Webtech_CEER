const Equipment = require('../models/Equipment');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Helper to upload to Cloudinary from buffer
const uploadFromBuffer = (buffer) => {
    return new Promise((resolve, reject) => {
        const cld_upload_stream = cloudinary.uploader.upload_stream(
            {
                folder: "equipments"
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

const addEquipment = async (req, res) => {
    try {
        const { name, description, inCharge, specification, additionalInfo } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Image is required' });
        }

        const result = await uploadFromBuffer(req.file.buffer);

        const newEquipment = new Equipment({
            name,
            specification,
            description,
            additionalInfo,
            imageUrl: result.secure_url,
            imageId: result.public_id,
            inCharge: inCharge || 'Lab Incharge'
        });

        await newEquipment.save();

        res.status(201).json({ success: true, data: newEquipment, message: 'Equipment added successfully' });
    } catch (error) {
        console.error('Error adding equipment:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const updateEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, inCharge, specification, additionalInfo } = req.body;

        const equipment = await Equipment.findById(id);
        if (!equipment) {
            return res.status(404).json({ success: false, message: 'Equipment not found' });
        }

        const updateData = {
            name,
            specification,
            description,
            additionalInfo,
            inCharge: inCharge || 'Lab Incharge'
        };

        // Handle image update if a new file is uploaded
        if (req.file) {
            // Delete old image from Cloudinary
            if (equipment.imageId) {
                await cloudinary.uploader.destroy(equipment.imageId);
            }

            // Upload new image
            const result = await uploadFromBuffer(req.file.buffer);
            updateData.imageUrl = result.secure_url;
            updateData.imageId = result.public_id;
        }

        const updatedEquipment = await Equipment.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        res.status(200).json({ success: true, data: updatedEquipment, message: 'Equipment updated successfully' });
    } catch (error) {
        console.error('Error updating equipment:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getEquipments = async (req, res) => {
    try {
        const equipments = await Equipment.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: equipments });
    } catch (error) {
        console.error('Error fetching equipments:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const deleteEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        const equipment = await Equipment.findById(id);

        if (!equipment) {
            return res.status(404).json({ success: false, message: 'Equipment not found' });
        }

        // Delete image from Cloudinary
        await cloudinary.uploader.destroy(equipment.imageId);

        await Equipment.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: 'Equipment deleted successfully' });
    } catch (error) {
        console.error('Error deleting equipment:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    addEquipment,
    updateEquipment,
    getEquipments,
    deleteEquipment
};
