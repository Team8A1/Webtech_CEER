const express = require('express');
const router = express.Router();
const {
    createBOMRequest,
    getStudentBOMRequests,
    getFacultyBOMRequests,
    updateBOMRequestStatus,
    updateBOMRequest,
    deleteBOMRequest
} = require('../controllers/bomController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Student Routes
router.post('/student/request/bom', protect, authorize('student'), createBOMRequest);
router.get('/student/request/bom', protect, authorize('student'), getStudentBOMRequests);
router.put('/student/request/bom/:id', protect, authorize('student'), updateBOMRequest);
router.delete('/student/request/bom/:id', protect, authorize('student'), deleteBOMRequest);

// Faculty Routes
router.get('/faculty/bom/list', protect, authorize('faculty'), getFacultyBOMRequests);
router.patch('/faculty/bom/update', protect, authorize('faculty'), updateBOMRequestStatus);

// Lab Routes
const { getLabBOMRequests, approveLabBOMRequest, rejectLabBOMRequest } = require('../controllers/labBOMController');
router.get('/lab/bom/list', protect, authorize('labIncharge'), getLabBOMRequests);
router.patch('/lab/bom/approve', protect, authorize('labIncharge'), approveLabBOMRequest);
router.patch('/lab/bom/reject', protect, authorize('labIncharge'), rejectLabBOMRequest);

module.exports = router;
