const BOMRequest = require('../models/bomRequest.model');
const Material = require('../models/material.model');

// @desc    Get embodied energy analysis for approved BOM items (team-based)
// @route   GET /api/energy/analysis
// @access  Private (Student)
const getEnergyAnalysis = async (req, res) => {
    try {
        // FIX: use req.user.teamId directly — no extra User.findById() round-trip
        const studentId = req.user._id;
        const teamId    = req.user.teamId;

        // Build query - if student has a team, get all team BOMs
        const query = {
            guideApproved: true,
            labApproved: true,
            ...(teamId ? { teamId } : { studentId })
        };

        const bomRequests = await BOMRequest.find(query);

        // FIX: batch-fetch all materials upfront — no N+1 per BOM iteration
        const uniqueNames = [...new Set(bomRequests.map(b => b.consumableName))];
        const materials   = uniqueNames.length
            ? await Material.find({ name: { $in: uniqueNames.map(n => new RegExp(`^${n}$`, 'i')) } })
            : [];

        // Build a case-insensitive lookup map: name.toLowerCase() -> material doc
        const materialMap = {};
        materials.forEach(m => { materialMap[m.name.toLowerCase()] = m; });

        const analysisData = [];
        let totalSystemEnergy = 0;

        for (const bom of bomRequests) {
            // O(1) lookup instead of a DB query per bom
            const material = materialMap[bom.consumableName?.toLowerCase()];

            let volume     = 0; // m³
            let weight     = 0; // kg
            let energy     = 0; // MJ
            let unitEnergy = 0; // MJ/kg
            let density    = 0;
            let dims       = { L: bom.length, W: bom.width, T: 0 };
            let formType   = 'unknown';

            if (material) {
                density    = material.density;
                unitEnergy = material.embodiedEnergy;
                formType   = material.formType;

                // 1. Manual Weight Override
                if (bom.weight > 0) {
                    weight = bom.weight * bom.qty;
                }
                // 2. Sheet: Vol = L × W × Thickness(mm→m)
                else if (material.formType === 'sheet') {
                    const thicknessM = material.fixedDimension / 1000;
                    dims.T  = material.fixedDimension;
                    volume  = bom.length * bom.width * thicknessM * bom.qty;
                    weight  = volume * density;
                }
                // 3. Rod: Vol = π × r² × L
                else if (material.formType === 'rod') {
                    const radiusM = (material.fixedDimension / 2) / 1000;
                    dims.T  = material.fixedDimension;
                    volume  = Math.PI * Math.pow(radiusM, 2) * bom.length * bom.qty;
                    weight  = volume * density;
                }
                // 4. Unit: fixedDimension holds weight-per-unit (kg)
                else if (material.formType === 'unit') {
                    weight = (material.fixedDimension || 0) * bom.qty;
                }
            } else {
                // Material not in DB — fallback to manual weight
                if (bom.weight > 0) {
                    weight = bom.weight * bom.qty;
                }
            }

            energy             = weight * unitEnergy;
            totalSystemEnergy += energy;

            analysisData.push({
                _id:        bom._id,
                partName:   bom.partName,
                materialName: bom.consumableName,
                formType,
                dimensions: {
                    length:    bom.length,
                    width:     bom.width,
                    thickness: dims.T   // or diameter for rod
                },
                qty:        bom.qty,
                volume:     parseFloat(volume.toFixed(8)),
                weight:     parseFloat(weight.toFixed(4)),
                density,
                unitEnergy,
                totalEnergy: parseFloat(energy.toFixed(4))
            });
        }

        res.status(200).json({
            success: true,
            data: analysisData,
            totalEnergy: parseFloat(totalSystemEnergy.toFixed(4))
        });

    } catch (error) {
        console.error('Error calculating energy:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { getEnergyAnalysis };
