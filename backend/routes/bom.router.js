const express = require('express');
const router = express.Router();
const {
    createBOMRequest,
    getStudentBOMRequests,
    getFacultyBOMRequests,
    updateBOMRequestStatus,
    updateBOMRequest,
    deleteBOMRequest
} = require('../controllers/bom.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { paginate } = require('../middleware/paginate.middleware');

// Student Routes
router.post('/student/request/bom', protect, authorize('student'), createBOMRequest);
router.get('/student/request/bom', protect, authorize('student'), getStudentBOMRequests);
router.put('/student/request/bom/:id', protect, authorize('student'), updateBOMRequest);
router.delete('/student/request/bom/:id', protect, authorize('student'), deleteBOMRequest);

// Faculty Routes — paginated list
router.get('/faculty/bom/list', protect, authorize('faculty'), paginate, getFacultyBOMRequests);
router.patch('/faculty/bom/update', protect, authorize('faculty'), updateBOMRequestStatus);

// Lab Routes — paginated list
const { getLabBOMRequests, approveLabBOMRequest, rejectLabBOMRequest, editLabBOMRequest } = require('../controllers/labBOM.controller');
router.get('/lab/bom/list', protect, authorize('labIncharge'), paginate, getLabBOMRequests);
router.patch('/lab/bom/approve', protect, authorize('labIncharge'), approveLabBOMRequest);
router.patch('/lab/bom/reject', protect, authorize('labIncharge'), rejectLabBOMRequest);
router.patch('/lab/bom/edit', protect, authorize('labIncharge'), editLabBOMRequest);

module.exports = router;
