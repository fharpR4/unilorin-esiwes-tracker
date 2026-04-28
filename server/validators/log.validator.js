const { body } = require('express-validator');

const createLogValidation = [
  body('applicationId')
    .notEmpty().withMessage('Application ID is required.')
    .isMongoId().withMessage('Application ID must be a valid ID.'),
  body('dateOfActivity')
    .notEmpty().withMessage('Date of activity is required.')
    .isISO8601().withMessage('Date of activity must be a valid ISO 8601 date.'),
  body('dayNumber')
    .notEmpty().withMessage('Day number is required.')
    .isInt({ min: 1 }).withMessage('Day number must be a positive integer.'),
  body('title')
    .trim()
    .notEmpty().withMessage('Log title is required.')
    .isLength({ max: 200 }).withMessage('Log title cannot exceed 200 characters.'),
  body('description')
    .trim()
    .notEmpty().withMessage('Log description is required.')
    .isLength({ min: 50 }).withMessage('Log description must be at least 50 characters long.')
    .isLength({ max: 5000 }).withMessage('Log description cannot exceed 5000 characters.'),
  body('portraitImage')
    .notEmpty().withMessage('Portrait headshot is required. Please capture using your device camera.')
    .isString().withMessage('Portrait image must be a Base64 string.'),
  body('environmentImage')
    .notEmpty().withMessage('Environment photo is required. Please capture using your device camera.')
    .isString().withMessage('Environment image must be a Base64 string.'),
  body('geolocation.coordinates')
    .isArray({ min: 2, max: 2 }).withMessage('Geolocation must contain [longitude, latitude] coordinates.'),
  body('geolocation.coordinates.*')
    .isFloat().withMessage('Coordinate values must be valid numbers.'),
];

const approveLogValidation = [
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters.'),
];

const rejectLogValidation = [
  body('rejectionReason')
    .trim()
    .notEmpty().withMessage('Rejection reason is required when rejecting a log.')
    .isLength({ max: 1000 }).withMessage('Rejection reason cannot exceed 1000 characters.'),
];

module.exports = {
  createLogValidation,
  approveLogValidation,
  rejectLogValidation,
};