const BOMRequest = require('../models/BOMRequest');
const User = require('../models/User');
const Faculty = require('../models/Faculty');
const Team = require('../models/Team');
const { sendEmail } = require('../utils/emailUtil');

// @desc    Create a new BOM request
// @route   POST /api/student/request/bom
// @access  Private (Student)
const createBOMRequest = async (req, res) => {
    try {
        const { slNo, sprintNo, date, partName, consumableName, specification, qty, notifyGuide } = req.body;
        const studentId = req.user._id;

        // Get student details to find guide and team
        const student = await User.findById(studentId).populate('guideId').populate('teamId');

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        if (!student.guideId) {
            return res.status(400).json({ success: false, message: 'You do not have a guide assigned.' });
        }

        const bomRequest = await BOMRequest.create({
            studentId,
            guideId: student.guideId._id,
            teamId: student.teamId ? student.teamId._id : null,
            slNo,
            sprintNo,
            date,
            partName,
            consumableName,
            specification,
            qty,
            status: 'pending'
        });

        // Send Email to guide
        const guideEmail = student.guideId.email;
        const studentName = student.name;
        const teamId = student.teamId ? student.teamId._id : 'N/A';
        const problemStatement = student.problemStatement || 'N/A';

        const subject = `New BOM Request from ${studentName}`;
        const text = `Student ${studentName} (Team: ${teamId}) has requested a new BOM item.\n\nItem: ${partName}\nQty: ${qty}\nSpecification: ${specification}\n\nPlease login to the dashboard to approve or reject.`;
        const html = `
      <h3>New BOM Request</h3>
      <p><strong>Student:</strong> ${studentName}</p>
      <p><strong>Team ID:</strong> ${teamId}</p>
      <p><strong>Problem Statement:</strong> ${problemStatement}</p>
      <hr/>
      <p><strong>Item:</strong> ${partName}</p>
      <p><strong>Quantity:</strong> ${qty}</p>
      <p><strong>Specification:</strong> ${specification}</p>
      <br/>
      <p>Please login to your faculty dashboard to review this request.</p>
    `;

        if (notifyGuide !== false) { // Default to true if not provided, or check explicitly
            if (guideEmail) {
                await sendEmail(guideEmail, subject, text, html);
            } else {
                console.log(`Guide for ${studentName} has no email.`);
            }
        }

        res.status(201).json({
            success: true,
            data: bomRequest,
            message: 'BOM Request submitted successfully'
        });

    } catch (error) {
        console.error('Error creating BOM request:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all BOM requests for a student
// @route   GET /api/student/request/bom
// @access  Private (Student)
const getStudentBOMRequests = async (req, res) => {
    try {
        const requests = await BOMRequest.find({ studentId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        console.error('Error fetching student BOM requests:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all BOM requests for a faculty (guide)
// @route   GET /api/faculty/bom/list
// @access  Private (Faculty)
const getFacultyBOMRequests = async (req, res) => {
    try {
        // Find requests where this faculty is the guide
        const requests = await BOMRequest.find({ guideId: req.user._id })
            .populate('studentId', 'name email')
            .populate('teamId', 'problemStatement')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        console.error('Error fetching faculty BOM requests:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update BOM request (Student)
// @route   PUT /api/student/request/bom/:id
// @access  Private (Student)
const updateBOMRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { slNo, sprintNo, date, partName, consumableName, specification, qty } = req.body;
        const studentId = req.user._id;

        const bomRequest = await BOMRequest.findById(id);

        if (!bomRequest) {
            return res.status(404).json({ success: false, message: 'BOM Request not found' });
        }

        if (bomRequest.studentId.toString() !== studentId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (bomRequest.guideApproved) {
            return res.status(400).json({ success: false, message: 'Cannot edit after guide approval' });
        }

        bomRequest.slNo = slNo || bomRequest.slNo;
        bomRequest.sprintNo = sprintNo || bomRequest.sprintNo;
        bomRequest.date = date || bomRequest.date;
        bomRequest.partName = partName || bomRequest.partName;
        bomRequest.consumableName = consumableName || bomRequest.consumableName;
        bomRequest.specification = specification || bomRequest.specification;
        bomRequest.qty = qty || bomRequest.qty;

        await bomRequest.save();

        res.status(200).json({ success: true, data: bomRequest, message: 'BOM Request updated' });
    } catch (error) {
        console.error('Error updating BOM request:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete BOM request (Student)
// @route   DELETE /api/student/request/bom/:id
// @access  Private (Student)
const deleteBOMRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = req.user._id;

        const bomRequest = await BOMRequest.findById(id);

        if (!bomRequest) {
            return res.status(404).json({ success: false, message: 'BOM Request not found' });
        }

        if (bomRequest.studentId.toString() !== studentId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (bomRequest.guideApproved) {
            return res.status(400).json({ success: false, message: 'Cannot delete after guide approval' });
        }

        await bomRequest.deleteOne();

        res.status(200).json({ success: true, message: 'BOM Request deleted' });
    } catch (error) {
        console.error('Error deleting BOM request:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update BOM request status or details (Faculty)
// @route   PATCH /api/faculty/bom/update
// @access  Private (Faculty)
const updateBOMRequestStatus = async (req, res) => {
    try {
        const { id, status, slNo, sprintNo, date, partName, consumableName, specification, qty, reason } = req.body;

        const bomRequest = await BOMRequest.findById(id);

        if (!bomRequest) {
            return res.status(404).json({ success: false, message: 'BOM Request not found' });
        }

        // Ensure the faculty updating is the assigned guide
        if (bomRequest.guideId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this request' });
        }

        // Update fields if provided
        if (slNo) bomRequest.slNo = slNo;
        if (sprintNo) bomRequest.sprintNo = sprintNo;
        if (date) bomRequest.date = date;
        if (partName) bomRequest.partName = partName;
        if (consumableName) bomRequest.consumableName = consumableName;
        if (specification) bomRequest.specification = specification;
        if (qty) bomRequest.qty = qty;

        // Update status if provided
        if (status) {
            if (!['approved', 'rejected', 'pending'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status' });
            }
            bomRequest.status = status;
            if (status === 'approved') {
                bomRequest.guideApproved = true;
                bomRequest.guideApprovedAt = Date.now();
            } else if (status === 'rejected') {
                bomRequest.guideApproved = false;
                bomRequest.guideApprovedAt = null;
                // Reset lab approval if rejected by guide (though unlikely to be lab approved if guide hasn't)
                bomRequest.labApproved = false;
                if (reason) {
                    bomRequest.rejectionReason = reason;
                }
            }
        }

        await bomRequest.save();

        res.status(200).json({ success: true, data: bomRequest, message: 'BOM Request updated' });
    } catch (error) {
        console.error('Error updating BOM request:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    createBOMRequest,
    getStudentBOMRequests,
    getFacultyBOMRequests,
    updateBOMRequestStatus,
    updateBOMRequest,
    deleteBOMRequest
};
