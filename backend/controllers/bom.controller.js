const BOMRequest = require('../models/bomRequest.model');
const User = require('../models/user.model');
const Faculty = require('../models/faculty.model');
const Team = require('../models/team.model');
const { enqueueEmail } = require('../queues/email.queue');


const createBOMRequest = async (req, res) => {
    try {
        const { slNo, sprintNo, date, partName, consumableName, specification, qty, length, width, weight, notifyGuide } = req.body;

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

        // ── Queue emails asynchronously via BullMQ ────────────────────────────
        // The HTTP response is returned immediately (line below); emails are
        // delivered by the worker without blocking the student's request.
        if (notifyGuide !== false) {
            if (guideEmail) {
                enqueueEmail('bom_submitted', {
                    guideEmail,
                    studentName,
                    studentUsn,
                    teamId: teamId?.toString() || 'N/A',
                    problemStatement,
                    partName,
                    consumableName,
                    qty,
                    specification,
                }).catch(err => console.error('[BOM] enqueueEmail bom_submitted error:', err.message));
            }

            if (student.email) {
                enqueueEmail('bom_copy', {
                    to:          student.email,
                    studentName,
                    guideName:   student.guideId?.name || 'N/A',
                    partName,
                    qty,
                    submittedAt: new Date().toLocaleDateString(),
                }).catch(err => console.error('[BOM] enqueueEmail bom_copy error:', err.message));
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
        let teamId;

        // If student is part of a team, get all BOMs for that team
        if (student && student.teamId) {
            teamId = student.teamId;
            requests = await BOMRequest.find({ teamId })
                .populate('studentId', 'name email')
                .sort({ createdAt: 1 }); // ascending: oldest = SL 01
        } else {
            // If not in a team, get only their own BOMs
            requests = await BOMRequest.find({ studentId: req.user._id })
                .sort({ createdAt: 1 });
            teamId = null;
        }

        // Auto-heal: renumber SL numbers if they are not already sequential
        // This fixes any legacy data with wrong SL numbers silently on load
        const needsRenumber = requests.some(
            (item, index) => item.slNo !== String(index + 1).padStart(2, '0')
        );
        if (needsRenumber && requests.length > 0) {
            const bulkOps = requests.map((item, index) => ({
                updateOne: {
                    filter: { _id: item._id },
                    update: { $set: { slNo: String(index + 1).padStart(2, '0') } }
                }
            }));
            await BOMRequest.bulkWrite(bulkOps);
            // Update the in-memory requests to reflect new slNos before responding
            requests = requests.map((item, index) => {
                item.slNo = String(index + 1).padStart(2, '0');
                return item;
            });
        }

        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        console.error('Error fetching student BOM requests:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all BOM requests for a faculty (guide) — paginated
// @route   GET /api/faculty/bom/list?page=1&limit=20&sort=createdAt&order=desc
// @access  Private (Faculty)
const getFacultyBOMRequests = async (req, res) => {
    try {
        const { paginateQuery, buildMeta } = require('../middleware/paginate.middleware');
        const pag = req.pagination; // set by paginate middleware on the route

        const filter = { guideId: req.user._id };

        // Optional status filter: ?status=pending|approved|rejected
        if (req.query.status) filter.status = req.query.status;

        const [total, requests] = await Promise.all([
            BOMRequest.countDocuments(filter),
            paginateQuery(
                BOMRequest.find(filter)
                    .populate('studentId', 'name email')
                    .populate('teamId', 'problemStatement'),
                pag
            ),
        ]);

        res.status(200).json({
            success: true,
            data: requests,
            pagination: buildMeta(total, pag),
        });
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

        // Renumber all remaining BOM items for this TEAM sequentially
        const teamId = bomRequest.teamId;
        const remaining = await BOMRequest.find({ teamId }).sort({ createdAt: 1 });
        const bulkOps = remaining.map((item, index) => ({
            updateOne: {
                filter: { _id: item._id },
                update: { $set: { slNo: String(index + 1).padStart(2, '0') } }
            }
        }));
        if (bulkOps.length > 0) {
            await BOMRequest.bulkWrite(bulkOps);
        }

        res.status(200).json({ success: true, message: 'BOM Request deleted and items renumbered' });
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
                // Reset lab approval if rejected by guide
                bomRequest.labApproved = false;
                bomRequest.rejectedBy = 'guide';
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
                    // BUG FIX: Use Faculty model, not User model
                    const facultyDoc = await Faculty.findById(req.user._id);
                    const facultyName = facultyDoc ? facultyDoc.name : 'Your Faculty Guide';

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
                            <p><a href="https://webtech-ceer.vercel.app/login/student" style="background-color: #7f1d1d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View Dashboard</a></p>
                            
                            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 12px;">This is an automated notification from CEER Portal.</p>
                        </div>
                    `;

                    // Queue status email — fire-and-forget, never blocks the response
                    enqueueEmail('bom_status', {
                        to:          student.email,
                        studentName: student.name,
                        facultyName,
                        status,
                        partName:    bomRequest.partName || bomRequest.consumableName,
                        qty:         bomRequest.qty,
                        specification: bomRequest.specification,
                        reason:      reason || null,
                    }).catch(err => console.error('[BOM] enqueueEmail bom_status error:', err.message));
                }
            } catch (emailError) {
                console.error('Error queueing email to student:', emailError);
                // Don't fail the request if queueing fails
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
