const express = require('express');
const router = express.Router();
const { submitProject, getMyProject, updateProject, getPendingProjects, approveProject, rejectProject, getAllProjects } = require('../controllers/project.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(protect);
router.post('/', authorize('student'), submitProject);
router.get('/mine', authorize('student'), getMyProject);
router.put('/:id', authorize('student'), updateProject);
router.get('/pending', authorize('supervisor'), getPendingProjects);
router.patch('/:id/approve', authorize('supervisor'), approveProject);
router.patch('/:id/reject', authorize('supervisor'), rejectProject);
router.get('/', authorize('coordinator', 'admin'), getAllProjects);

module.exports = router;