const BOMRequest = require('../models/BOMRequest');
const Material = require('../models/Material');

// @desc    Get embodied energy analysis for approved BOM items
// @route   GET /api/energy/analysis
// @access  Private (Student)
const getEnergyAnalysis = async (req, res) => {
    try {
        const studentId = req.user._id;

        // Fetch pending, approved, or rejected doesn't matter for analysis, but usually we filter for approved?
        // Current requirement: "approved by both faculty and lab in charge"
        const bomRequests = await BOMRequest.find({
            studentId,
            guideApproved: true,
            labApproved: true
        });

        const analysisData = [];
        let totalSystemEnergy = 0;

        // We need to match names to materials. 
        // This is tricky because BOMRequest stores 'consumableName' as a string.
        // We will try to find a Material with that name (case insensitive).

        for (const bom of bomRequests) {
            const material = await Material.findOne({
                name: { $regex: new RegExp(`^${bom.consumableName}$`, 'i') }
            });

            let volume = 0; // m3
            let weight = 0; // kg
            let energy = 0; // MJ
            let unitEnergy = 0; // MJ/kg
            let density = 0;
            let dims = { L: bom.length, W: bom.width, T: 0 }; // T/D/Weight from Fixed
            let formType = 'unknown';

            if (material) {
                density = material.density;
                unitEnergy = material.embodiedEnergy;
                console.log(`Analyzing: ${bom.consumableName}, Form: ${material.formType}, FixedDim: ${material.fixedDimension}`);
                formType = material.formType;

                // --- Calculation Logic ---

                // 1. Manual Weight Override (Unit items or special cases)
                if (bom.weight > 0) {
                    weight = bom.weight * bom.qty; // Total weight
                    // Volume not easily calculable if only weight is given, keep 0 or approx?
                }
                // 2. Sheet Calculation
                else if (material.formType === 'sheet') {
                    // Vol = L * W * Thickness
                    // Length/Width in meters. FixedDimension (Thickness) in mm -> convert to m
                    const thicknessM = material.fixedDimension / 1000;
                    dims.T = material.fixedDimension; // Store in mm for display
                    volume = bom.length * bom.width * thicknessM * bom.qty;
                    weight = volume * density;
                }
                // 3. Rod Calculation
                else if (material.formType === 'rod') {
                    // Vol = PI * r^2 * L
                    // Radius = (Diameter/2) (mm) -> convert to m
                    const radiusM = (material.fixedDimension / 2) / 1000;
                    dims.T = material.fixedDimension; // Diameter in mm
                    volume = Math.PI * Math.pow(radiusM, 2) * bom.length * bom.qty;
                    weight = volume * density;
                }
                // 4. Unit Calculation (Fixed Weight from Material)
                else if (material.formType === 'unit') {
                    // fixedDimension holds 'Weight per Unit' in kg for unit items
                    const weightPerUnit = material.fixedDimension || 0;
                    weight = weightPerUnit * bom.qty;
                }
            } else {
                // Material not found in DB - Fallback to manual weight if provided
                if (bom.weight > 0) {
                    weight = bom.weight * bom.qty;
                }
            }

            // Calculate Energy
            energy = weight * unitEnergy;
            totalSystemEnergy += energy;

            // Save calculated weight back to BOM if needed? (optional, skipping for now to keep read-only optimization)

            analysisData.push({
                _id: bom._id,
                partName: bom.partName,
                materialName: bom.consumableName,
                formType: formType,
                dimensions: {
                    length: bom.length,
                    width: bom.width,
                    thickness: dims.T // or Diameter
                },
                qty: bom.qty,
                volume: parseFloat(volume.toFixed(8)),
                weight: parseFloat(weight.toFixed(4)),
                density: density,
                unitEnergy: unitEnergy,
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
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = { getEnergyAnalysis };
