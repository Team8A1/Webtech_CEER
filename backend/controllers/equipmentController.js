const pdf = require('pdf-parse');
const csv = require('csv-parser');
const { Readable } = require('stream');

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

const bulkImportEquipment = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'File is required' });
        }

        const fileType = req.file.mimetype;
        const buffer = req.file.buffer;
        let equipmentList = [];

        if (fileType === 'application/pdf') {
            const data = await pdf(buffer);
            const text = data.text;

            // Parsing Logic for the specific PDF structure
            // 1. Extract Consumables (Numbered list)
            const consumablesRegex = /(\d+)\.\s+([^\r\n]+)/g;
            let match;
            while ((match = consumablesRegex.exec(text)) !== null) {
                const name = match[2].trim();
                // Basic clean up: remove trailing numbers/specs if they look like quantities
                equipmentList.push({
                    name: name,
                    category: 'Consumable',
                    description: 'Imported from Equipment List',
                    specification: 'Standard',
                    quantity: 1, // Default
                    inCharge: 'Lab Incharge',
                    imageUrl: 'https://via.placeholder.com/150?text=No+Image' // Placeholder
                });
            }

            // 2. Attempt to extract Tools (Heuristic: Lines that look like titles followed by descriptions)
            // This is harder to perfect without structure, so we might stick to Consumables or simple key phrases
            // For now, let's look for common tool names if they appear on their own lines
            const toolKeywords = ['Hammer', 'Screwdriver', 'Pliers', 'Wrench', 'Drill', 'Saw', 'Chisel', 'Multimeter', 'Soldering Iron'];
            const lines = text.split('\n');
            lines.forEach((line, index) => {
                const trimmed = line.trim();
                if (toolKeywords.some(keyword => trimmed.includes(keyword)) && trimmed.length < 50 && !trimmed.match(/^\d+\./)) {
                    // Potential tool title
                    // Look ahead for description
                    let desc = "Imported Tool";
                    if (lines[index + 1] && lines[index + 1].length > 20) {
                        desc = lines[index + 1].trim();
                    }
                    equipmentList.push({
                        name: trimmed,
                        category: 'Tool',
                        description: desc,
                        specification: 'Standard',
                        inCharge: 'Lab Incharge',
                        imageUrl: 'https://via.placeholder.com/150?text=Tool'
                    });
                }
            });

        } else if (fileType === 'text/csv' || fileType === 'application/vnd.ms-excel') {
            // CSV Parsing
            const stream = Readable.from(buffer.toString());
            await new Promise((resolve, reject) => {
                stream
                    .pipe(csv())
                    .on('data', (row) => {
                        // Map CSV columns to model. Expect headers: Name, Specification, Description, Quantity
                        if (row.Name) {
                            equipmentList.push({
                                name: row.Name,
                                specification: row.Specification || '',
                                description: row.Description || '',
                                additionalInfo: row.AdditionalInfo || '',
                                inCharge: row.InCharge || 'Lab Incharge',
                                imageUrl: row.Image || 'https://via.placeholder.com/150?text=No+Image'
                            });
                        }
                    })
                    .on('end', resolve)
                    .on('error', reject);
            });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid file type. Upload PDF or CSV.' });
        }

        if (equipmentList.length === 0) {
            return res.status(400).json({ success: false, message: 'No items found to import.' });
        }

        // Insert into DB
        // Use insertMany with ordered: false to continue even if some fail (e.g., duplicates if unique constraint exists)
        // However, equipment name is not unique in model schema usually, but let's check.
        // Assuming simple insert for now.
        const result = await Equipment.insertMany(equipmentList);

        res.status(200).json({
            success: true,
            message: `Successfully imported ${result.length} items.`,
            count: result.length,
            sample: result.slice(0, 3)
        });

    } catch (error) {
        console.error('Error processing bulk import:', error);
        res.status(500).json({ success: false, message: 'Bulk Import Failed: ' + error.message });
    }
};

module.exports = {
    addEquipment,
    updateEquipment,
    getEquipments,
    deleteEquipment,
    bulkImportEquipment
};
