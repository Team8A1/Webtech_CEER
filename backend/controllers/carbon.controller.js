const BOMRequest = require('../models/bomRequest.model');
const Material = require('../models/material.model');

// @desc    Get carbon footprint analysis for approved BOM items (team-based)
// @route   GET /api/carbon/analysis
// @access  Private (Student)
const getCarbonAnalysis = async (req, res) => {
    try {
        // FIX #2: req.user is already populated by auth middleware — no extra DB query needed
        const studentId = req.user._id;
        const teamId = req.user.teamId;

        // Build query - if student has a team, get all team BOMs
        let query = {
            guideApproved: true,
            labApproved: true
        };

        if (teamId) {
            query.teamId = teamId;
        } else {
            query.studentId = studentId;
        }

        const bomRequests = await BOMRequest.find(query);

        // FIX #1: Batch-fetch all materials in one query (eliminates N+1 DB problem)
        const uniqueNames = [...new Set(bomRequests.map(b => b.consumableName))];
        const materialsRaw = await Material.find({
            name: { $in: uniqueNames.map(n => new RegExp(`^${n}$`, 'i')) }
        });
        // Build a lowercase lookup map for O(1) access
        const materialMap = new Map(materialsRaw.map(m => [m.name.toLowerCase(), m]));

        const analysisData = [];
        let totalSystemCarbon = 0;

        for (const bom of bomRequests) {
            // FIX #1 (continued): in-memory lookup instead of per-loop DB query
            const material = materialMap.get(bom.consumableName.toLowerCase());

            let volume = 0; // m³
            let weight = 0; // kg
            let carbon = 0; // kgCO2e
            let carbonFactor = 0; // kgCO2e/kg
            let density = 0;
            let dims = { L: bom.length, W: bom.width, T: 0 };
            let formType = 'unknown';
            // FIX #5: track how weight was derived so the frontend knows why volume may be null
            let calculationMethod = 'unknown';

            if (material) {
                density = material.density;
                carbonFactor = material.carbonFootprintFactor || 0;
                formType = material.formType;

                // --- Calculation Logic ---

                // 1. Manual Weight Override
                if (bom.weight > 0) {
                    weight = bom.weight * bom.qty;
                    calculationMethod = 'manual_weight';
                }
                // 2. Sheet Calculation
                // NOTE: bom.length and bom.width are stored in metres (see BOM model).
                //       material.fixedDimension (thickness) is in mm → divide by 1000.
                //       If the frontend ever sends dimensions in mm, volumes will be off by 10⁶.
                else if (material.formType === 'sheet') {
                    const thicknessM = material.fixedDimension / 1000;
                    dims.T = material.fixedDimension; // mm — for display only
                    volume = bom.length * bom.width * thicknessM * bom.qty;
                    weight = volume * density;
                    calculationMethod = 'sheet';
                }
                // 3. Rod Calculation (circular cross-section)
                // FIX #4: bom.width is intentionally ignored for circular rods.
                //         Add a 'square_rod' formType in the Material model if rectangular bars are needed.
                else if (material.formType === 'rod') {
                    const radiusM = (material.fixedDimension / 2) / 1000;
                    dims.T = material.fixedDimension; // Diameter in mm
                    volume = Math.PI * Math.pow(radiusM, 2) * bom.length * bom.qty;
                    weight = volume * density;
                    calculationMethod = 'rod';
                }
                // 4. Unit Calculation
                else if (material.formType === 'unit') {
                    const weightPerUnit = material.fixedDimension || 0;
                    weight = weightPerUnit * bom.qty;
                    calculationMethod = 'unit';
                }
            } else {
                // Material not found in DB — fall back to manual weight if provided
                if (bom.weight > 0) {
                    weight = bom.weight * bom.qty;
                    calculationMethod = 'manual_weight_fallback';
                }
            }

            // Calculate Carbon Footprint
            carbon = weight * carbonFactor;
            totalSystemCarbon += carbon;

            analysisData.push({
                _id: bom._id,
                partName: bom.partName,
                materialName: bom.consumableName,
                formType,
                calculationMethod, // FIX #5: tells the frontend why volume may be null
                dimensions: {
                    length: bom.length,
                    width: bom.width,
                    thickness: dims.T
                },
                qty: bom.qty,
                // FIX #5: null instead of misleading 0 when volume was not computed
                volume: calculationMethod === 'manual_weight' || calculationMethod === 'manual_weight_fallback'
                    ? null
                    : parseFloat(volume.toFixed(8)),
                weight: parseFloat(weight.toFixed(4)),
                density,
                carbonFactor,
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
        // FIX #6: expose root cause in non-production environments
        res.status(500).json({
            success: false,
            message: 'Server Error',
            ...(process.env.NODE_ENV !== 'production' && { error: error.message })
        });
    }
};

module.exports = { getCarbonAnalysis };
