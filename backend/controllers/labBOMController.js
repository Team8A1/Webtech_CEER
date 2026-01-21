const BOMRequest = require('../models/BOMRequest');

// @desc    Get all BOM requests for Lab Incharge
// @route   GET /api/lab/bom/list
// @access  Private (LabIncharge)
const getLabBOMRequests = async (req, res) => {
    try {
        // Lab Incharges can see all requests, or filter as needed.
        // Requirement: "lab incharge will get request only after the faculty approves the request"

        const requests = await BOMRequest.find({ guideApproved: true })
            .populate('studentId', 'name email usn')
            .populate('teamId', 'problemStatement')
            .populate('guideId', 'name email')
            .populate('labApprovedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        console.error('Error fetching lab BOM requests:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Approve BOM request by Lab Incharge
// @route   PATCH /api/lab/bom/approve
// @access  Private (LabIncharge)
const approveLabBOMRequest = async (req, res) => {
    try {
        const { id } = req.body;
        const labInchargeId = req.user._id;

        const bomRequest = await BOMRequest.findById(id);

        if (!bomRequest) {
            return res.status(404).json({ success: false, message: 'BOM Request not found' });
        }

        // Requirement: "lab incharge will get request only after the faculty approves the request"
        if (!bomRequest.guideApproved) {
            return res.status(400).json({ success: false, message: 'Cannot approve. Guide approval is pending.' });
        }

        bomRequest.labApproved = true;
        bomRequest.labApprovedBy = labInchargeId;
        bomRequest.labApprovedAt = Date.now();
        // Status can remain 'approved' as it was set by guide, or we can have a separate 'lab_approved' status if needed.
        // For now, keeping 'approved' as the final status, but flags indicate progress.

        await bomRequest.save();

        res.status(200).json({ success: true, data: bomRequest, message: 'BOM Request Approved by Lab Incharge' });
    } catch (error) {
        console.error('Error approving BOM request by Lab:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Reject BOM request by Lab Incharge
// @route   PATCH /api/lab/bom/reject
// @access  Private (LabIncharge)
const rejectLabBOMRequest = async (req, res) => {
    try {
        const { id, reason } = req.body;
        const labInchargeId = req.user._id;

        const bomRequest = await BOMRequest.findById(id);

        if (!bomRequest) {
            return res.status(404).json({ success: false, message: 'BOM Request not found' });
        }

        // Lab can only act if guide approved
        if (!bomRequest.guideApproved) {
            return res.status(400).json({ success: false, message: 'Guide has not approved yet' });
        }

        bomRequest.labApproved = false;
        bomRequest.labApprovedBy = labInchargeId;
        bomRequest.labApprovedAt = Date.now();
        bomRequest.status = 'rejected';
        if (reason) {
            bomRequest.rejectionReason = reason;
        }

        await bomRequest.save();

        res.status(200).json({ success: true, data: bomRequest, message: 'BOM Request Rejected by Lab Incharge' });
    } catch (error) {
        console.error('Error rejecting BOM request by Lab:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const editLabBOMRequest = async (req, res) => {
    try {
        const { id, updates } = req.body;
        const labInchargeId = req.user._id;

        const bomRequest = await BOMRequest.findById(id);

        if (!bomRequest) {
            return res.status(404).json({ success: false, message: 'BOM Request not found' });
        }

        // Lab can only act if guide approved
        if (!bomRequest.guideApproved) {
            return res.status(400).json({ success: false, message: 'Guide has not approved yet' });
        }

        // Allowed fields to update
        const allowedFields = ['consumableName', 'specification', 'qty', 'partName', 'sprintNo', 'length', 'width', 'thickness', 'weight'];

        // Track changes for edit history
        const changes = new Map();

        for (const field of allowedFields) {
            if (updates[field] !== undefined && updates[field] !== bomRequest[field]) {
                changes.set(field, { oldValue: bomRequest[field], newValue: updates[field] });
                bomRequest[field] = updates[field];
            }
        }

        // Add to edit history if there were changes
        if (changes.size > 0) {
            bomRequest.editHistory.push({
                editedBy: labInchargeId,
                editedByModel: 'LabIncharge',
                editedByRole: 'labIncharge',
                editedAt: new Date(),
                changes: Object.fromEntries(changes) // Convert Map to Object for Mongoose schema
            });
        }

        await bomRequest.save();

        res.status(200).json({ success: true, data: bomRequest, message: 'BOM Request Updated by Lab Incharge' });
    } catch (error) {
        console.error('Error updating BOM request by Lab:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getLabBOMRequests,
    approveLabBOMRequest,
    rejectLabBOMRequest,
    editLabBOMRequest
};
