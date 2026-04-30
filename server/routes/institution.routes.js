const express = require('express');
const router = express.Router();
const { getAllInstitutions, createInstitution, updateInstitution, deleteInstitution } = require('../controllers/institution.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

// PUBLIC — no auth required so registration page can load institutions
router.get('/', getAllInstitutions);

// Admin-only mutations
router.use(protect);
router.post('/', authorize('admin'), createInstitution);
router.put('/:id', authorize('admin'), updateInstitution);
router.delete('/:id', authorize('admin'), deleteInstitution);

module.exports = router;