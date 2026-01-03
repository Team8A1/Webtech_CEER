const Instruction = require('../models/instruction.model');

exports.getInstruction = async (req, res) => {
    try {
        const { title } = req.params;
        let instruction = await Instruction.findOne({ title });
        if (!instruction) {
            // Return empty content if not found
            return res.status(200).json({ success: true, data: { title, content: '' } });
        }
        res.status(200).json({ success: true, data: instruction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateInstruction = async (req, res) => {
    try {
        const { title } = req.params;
        const { content } = req.body;
        let instruction = await Instruction.findOneAndUpdate(
            { title },
            { content, lastUpdatedBy: req.user?._id },
            { new: true, upsert: true }
        );
        res.status(200).json({ success: true, data: instruction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLatestUpdateTime = async (req, res) => {
    try {
        const latest = await Instruction.findOne().sort({ updatedAt: -1 }).select('updatedAt');
        res.status(200).json({ success: true, updatedAt: latest ? latest.updatedAt : null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
