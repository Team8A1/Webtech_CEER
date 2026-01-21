const BOMRequest = require('../models/BOMRequest');
const User = require('../models/User');
const Faculty = require('../models/Faculty');
const Team = require('../models/Team');
const { sendEmail } = require('../utils/emailUtil');


const createBOMRequest = async (req, res) => {
    try {
        const { slNo, sprintNo, date, partName, consumableName, specification, qty, length, width, weight, notifyGuide } = req.body;
        console.log("weight is ", weight);

        const studentId = req.user._id;

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
            length: length || 0,
            width: width || 0,
            weight: weight || 0,
            status: 'pending'
        });

        // Send Email to guide
        const guideEmail = student.guideId.email;
        const studentName = student.name;
        const studentUsn = student.usn || student.email || 'N/A';
        const teamId = student.teamId ? student.teamId._id : 'N/A';
        const problemStatement = student.problemStatement || 'N/A';

        const subject = `New BOM Request from ${studentName} (${studentUsn})`;
        const text = `Student ${studentName} (USN: ${studentUsn}, Team: ${teamId}) has requested a new BOM item.\n\nItem: ${partName}\nQty: ${qty}\nSpecification: ${specification}\n\nPlease login to the dashboard to approve or reject.`;
        const html = `
      <h3>New BOM Request</h3>
      <p><strong>Student:</strong> ${studentName}</p>
      <p><strong>USN:</strong> ${studentUsn}</p>
      <p><strong>Team ID:</strong> ${teamId}</p>
      <p><strong>Problem Statement:</strong> ${problemStatement}</p>
      <hr/>
      <p><strong>Item:</strong> ${partName}</p>
      <p><strong>Quantity:</strong> ${qty}</p>
      <p><strong>Specification:</strong> ${specification}</p>
      <br/>
      <p>Please login to your faculty dashboard to review this request.</p>
      <p> Enter Page : http://localhost:5173/login/faculty <p>
      
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

// @desc    Get all BOM requests for a student (or their team)
// @route   GET /api/student/request/bom
// @access  Private (Student)
const getStudentBOMRequests = async (req, res) => {
    try {
        const student = await User.findById(req.user._id);

        let requests;

        // If student is part of a team, get all BOMs for that team
        if (student && student.teamId) {
            requests = await BOMRequest.find({ teamId: student.teamId })
                .populate('studentId', 'name email')
                .sort({ createdAt: -1 });
        } else {
            // If not in a team, get only their own BOMs
            requests = await BOMRequest.find({ studentId: req.user._id }).sort({ createdAt: -1 });
        }

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
        const { slNo, sprintNo, date, partName, consumableName, specification, qty, length, width, weight } = req.body;
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
        if (length !== undefined) bomRequest.length = length;
        if (width !== undefined) bomRequest.width = width;
        if (weight !== undefined) bomRequest.weight = weight;

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

        // Track changes for edit history
        const changes = new Map();
        const editableFields = ['slNo', 'sprintNo', 'date', 'partName', 'consumableName', 'specification', 'qty'];

        // Update fields if provided and track changes
        if (slNo && slNo !== bomRequest.slNo) {
            changes.set('slNo', { oldValue: bomRequest.slNo, newValue: slNo });
            bomRequest.slNo = slNo;
        }
        if (sprintNo && sprintNo !== bomRequest.sprintNo) {
            changes.set('sprintNo', { oldValue: bomRequest.sprintNo, newValue: sprintNo });
            bomRequest.sprintNo = sprintNo;
        }
        if (date && new Date(date).getTime() !== new Date(bomRequest.date).getTime()) {
            changes.set('date', { oldValue: bomRequest.date, newValue: date });
            bomRequest.date = date;
        }
        if (partName && partName !== bomRequest.partName) {
            changes.set('partName', { oldValue: bomRequest.partName, newValue: partName });
            bomRequest.partName = partName;
        }
        if (consumableName && consumableName !== bomRequest.consumableName) {
            changes.set('consumableName', { oldValue: bomRequest.consumableName, newValue: consumableName });
            bomRequest.consumableName = consumableName;
        }
        if (specification && specification !== bomRequest.specification) {
            changes.set('specification', { oldValue: bomRequest.specification, newValue: specification });
            bomRequest.specification = specification;
        }
        if (qty && qty !== bomRequest.qty) {
            changes.set('qty', { oldValue: bomRequest.qty, newValue: qty });
            bomRequest.qty = qty;
        }

        // Add to edit history if there were changes
        if (changes.size > 0) {
            bomRequest.editHistory.push({
                editedBy: req.user._id,
                editedByModel: 'Faculty',
                editedByRole: 'guide',
                editedAt: new Date(),
                changes: changes
            });
        }

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

        // Send email notification to student
        if (status === 'approved' || status === 'rejected') {
            try {
                const student = await User.findById(bomRequest.studentId);
                if (student && student.email) {
                    const faculty = await User.findById(req.user._id);
                    const facultyName = faculty ? faculty.name : 'Your Faculty Guide';

                    const statusText = status === 'approved' ? 'APPROVED' : 'REJECTED';
                    const statusColor = status === 'approved' ? '#16a34a' : '#dc2626';

                    const subject = `BOM Request ${statusText} - ${bomRequest.partName || bomRequest.consumableName}`;
                    const text = `Your BOM request for ${bomRequest.partName || bomRequest.consumableName} has been ${status} by ${facultyName}.${status === 'rejected' && reason ? `\n\nReason: ${reason}` : ''}`;

                    const html = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #1f2937; border-bottom: 3px solid ${statusColor}; padding-bottom: 10px;">
                                BOM Request ${statusText}
                            </h2>
                            <p>Dear ${student.name},</p>
                            <p>Your BOM request has been <strong style="color: ${statusColor};">${status.toUpperCase()}</strong> by ${facultyName}.</p>
                            
                            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="margin-top: 0; color: #374151;">Request Details:</h3>
                                <p><strong>Item:</strong> ${bomRequest.partName || bomRequest.consumableName}</p>
                                <p><strong>Quantity:</strong> ${bomRequest.qty}</p>
                                <p><strong>Specification:</strong> ${bomRequest.specification}</p>
                                ${status === 'rejected' && reason ? `<p><strong style="color: #dc2626;">Reason for Rejection:</strong> ${reason}</p>` : ''}
                            </div>
                            
                            ${status === 'approved' ?
                            '<p style="color: #16a34a;">✓ Your request will now proceed to lab approval.</p>' :
                            '<p style="color: #dc2626;">You may need to submit a new request with the required modifications.</p>'
                        }
                            
                            <p>Please login to your student dashboard to view the full details.</p>
                            <p><a href="http://localhost:5173/login/student" style="background-color: #7f1d1d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View Dashboard</a></p>
                            
                            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 12px;">This is an automated notification from CEER Portal.</p>
                        </div>
                    `;

                    await sendEmail(student.email, subject, text, html);
                }
            } catch (emailError) {
                console.error('Error sending email to student:', emailError);
                // Don't fail the request if email fails
            }
        }

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
