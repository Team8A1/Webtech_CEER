const BOMRequest = require('../models/BOMRequest');
const Material = require('../models/Material');
const User = require('../models/User');

// @desc    Get carbon footprint analysis for approved BOM items (team-based)
// @route   GET /api/carbon/analysis
// @access  Private (Student)
const getCarbonAnalysis = async (req, res) => {
    try {
        const studentId = req.user._id;
        const student = await User.findById(studentId);

        // Build query - if student has a team, get all team BOMs
        let query = {
            guideApproved: true,
            labApproved: true
        };

        if (student && student.teamId) {
            query.teamId = student.teamId;
        } else {
            query.studentId = studentId;
        }

        const bomRequests = await BOMRequest.find(query);

        const analysisData = [];
        let totalSystemCarbon = 0;

        for (const bom of bomRequests) {
            const material = await Material.findOne({
                name: { $regex: new RegExp(`^${bom.consumableName}$`, 'i') }
            });

            let volume = 0; // m3
            let weight = 0; // kg
            let carbon = 0; // kgCO2e
            let carbonFactor = 0; // kgCO2e/kg
            let density = 0;
            let dims = { L: bom.length, W: bom.width, T: 0 };
            let formType = 'unknown';

            if (material) {
                density = material.density;
                carbonFactor = material.carbonFootprintFactor || 0;
                formType = material.formType;

                // --- Calculation Logic ---

                // 1. Manual Weight Override
                if (bom.weight > 0) {
                    weight = bom.weight * bom.qty;
                }
                // 2. Sheet Calculation
                else if (material.formType === 'sheet') {
                    const thicknessM = material.fixedDimension / 1000;
                    dims.T = material.fixedDimension; // Store in mm for display
                    volume = bom.length * bom.width * thicknessM * bom.qty;
                    weight = volume * density;
                }
                // 3. Rod Calculation
                else if (material.formType === 'rod') {
                    const radiusM = (material.fixedDimension / 2) / 1000;
                    dims.T = material.fixedDimension; // Diameter in mm
                    volume = Math.PI * Math.pow(radiusM, 2) * bom.length * bom.qty;
                    weight = volume * density;
                }
                // 4. Unit Calculation
                else if (material.formType === 'unit') {
                    const weightPerUnit = material.fixedDimension || 0;
                    weight = weightPerUnit * bom.qty;
                }
            } else {
                // Fallback
                if (bom.weight > 0) {
                    weight = bom.weight * bom.qty;
                }
            }

            // Calculate Carbon Footprint
            carbon = weight * carbonFactor;
            totalSystemCarbon += carbon;

            analysisData.push({
                _id: bom._id,
                partName: bom.partName,
                materialName: bom.consumableName,
                formType: formType,
                dimensions: {
                    length: bom.length,
                    width: bom.width,
                    thickness: dims.T
                },
                qty: bom.qty,
                volume: parseFloat(volume.toFixed(8)),
                weight: parseFloat(weight.toFixed(4)),
                density: density,
                carbonFactor: carbonFactor,
                totalCarbon: parseFloat(carbon.toFixed(4))
            });
        }

        res.status(200).json({
            success: true,
            data: analysisData,
            totalCarbon: parseFloat(totalSystemCarbon.toFixed(4))
        });

    } catch (error) {
        console.error('Error calculating carbon footprint:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = { getCarbonAnalysis };
