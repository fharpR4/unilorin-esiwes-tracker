const { body } = require('express-validator');

const updateUserValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters.'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters.'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Phone number cannot exceed 20 characters.'),
  body('courseOfStudy')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('Course of study cannot exceed 150 characters.'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('Department name cannot exceed 150 characters.'),
];

module.exports = { updateUserValidation };