import { body, param, query } from 'express-validator';

export const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'manager'])
    .withMessage('Role must be admin or manager'),
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const tenantValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('idNumber')
    .trim()
    .notEmpty()
    .withMessage('ID number is required'),
  body('emergencyContact.name')
    .trim()
    .notEmpty()
    .withMessage('Emergency contact name is required'),
  body('emergencyContact.phone')
    .trim()
    .notEmpty()
    .withMessage('Emergency contact phone is required'),
  body('emergencyContact.relationship')
    .trim()
    .notEmpty()
    .withMessage('Relationship is required'),
  body('room')
    .notEmpty()
    .withMessage('Room is required')
    .isMongoId()
    .withMessage('Invalid room ID'),
  body('leaseStart')
    .notEmpty()
    .withMessage('Lease start date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('leaseEnd')
    .notEmpty()
    .withMessage('Lease end date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('depositAmount')
    .notEmpty()
    .withMessage('Deposit amount is required')
    .isFloat({ min: 0 })
    .withMessage('Deposit amount must be a positive number'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'pending'])
    .withMessage('Status must be active, inactive, or pending'),
];

export const tenantUpdateValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'pending'])
    .withMessage('Status must be active, inactive, or pending'),
  body('room')
    .optional()
    .isMongoId()
    .withMessage('Invalid room ID'),
];

export const roomValidation = [
  body('roomNumber')
    .trim()
    .notEmpty()
    .withMessage('Room number is required'),
  body('floor')
    .notEmpty()
    .withMessage('Floor is required')
    .isInt({ min: 0 })
    .withMessage('Floor must be a non-negative integer'),
  body('type')
    .notEmpty()
    .withMessage('Room type is required')
    .isIn(['single', 'double', 'suite', 'studio'])
    .withMessage('Type must be single, double, suite, or studio'),
  body('monthlyRent')
    .notEmpty()
    .withMessage('Monthly rent is required')
    .isFloat({ min: 0 })
    .withMessage('Monthly rent must be a positive number'),
  body('status')
    .optional()
    .isIn(['available', 'occupied', 'maintenance'])
    .withMessage('Status must be available, occupied, or maintenance'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('size')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Size must be a positive number'),
];

export const roomUpdateValidation = [
  body('roomNumber')
    .optional()
    .trim(),
  body('floor')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Floor must be a non-negative integer'),
  body('type')
    .optional()
    .isIn(['single', 'double', 'suite', 'studio'])
    .withMessage('Type must be single, double, suite, or studio'),
  body('monthlyRent')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly rent must be a positive number'),
  body('status')
    .optional()
    .isIn(['available', 'occupied', 'maintenance'])
    .withMessage('Status must be available, occupied, or maintenance'),
];

export const paymentValidation = [
  body('tenant')
    .notEmpty()
    .withMessage('Tenant is required')
    .isMongoId()
    .withMessage('Invalid tenant ID'),
  body('room')
    .notEmpty()
    .withMessage('Room is required')
    .isMongoId()
    .withMessage('Invalid room ID'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('paymentType')
    .optional()
    .isIn(['rent', 'deposit', 'utility', 'late_fee', 'other'])
    .withMessage('Invalid payment type'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['cash', 'bank_transfer', 'mobile_money', 'check', 'card'])
    .withMessage('Invalid payment method'),
  body('paymentDate')
    .notEmpty()
    .withMessage('Payment date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('periodStart')
    .notEmpty()
    .withMessage('Period start date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('periodEnd')
    .notEmpty()
    .withMessage('Period end date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('status')
    .optional()
    .isIn(['paid', 'pending', 'overdue', 'partial'])
    .withMessage('Invalid status'),
  body('receiptNumber')
    .optional()
    .trim(),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

export const paymentUpdateValidation = [
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('status')
    .optional()
    .isIn(['paid', 'pending', 'overdue', 'partial'])
    .withMessage('Invalid status'),
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'bank_transfer', 'mobile_money', 'check', 'card'])
    .withMessage('Invalid payment method'),
];

export const idParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
];

export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .trim(),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
];

export const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = require('express-validator').validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err: any) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};
