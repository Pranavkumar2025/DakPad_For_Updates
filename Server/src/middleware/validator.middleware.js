import { body, validationResult } from "express-validator";

// Helper to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation Error",
      details: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Reusable Validators
export const validateName = (fieldName = "name") =>
  body(fieldName)
    .trim()
    .notEmpty()
    .withMessage(`${fieldName} is required`)
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage(`${fieldName} must contain only alphabets (no numbers or special characters)`);

export const validatePhone = (fieldName = "phone") =>
  body(fieldName)
    .optional({ checkFalsy: true }) // Optional but if present must be valid
    .trim()
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be exactly 10 digits");

export const validateEmail = (fieldName = "email") =>
  body(fieldName)
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage("Invalid email format");

export const validateRequired = (fieldName) =>
  body(fieldName).trim().notEmpty().withMessage(`${fieldName} is required`);

// Grouped Validators for Specific Routes

export const validateLogin = [
  validateRequired("password"),
  handleValidationErrors,
];

export const validateApplication = [
  validateName("name"),
  validatePhone("phone"),
  validateEmail("email"),
  validateRequired("applicationDate"),
  validateRequired("source"),
  validateRequired("subject"),
  validateRequired("block"),
  handleValidationErrors,
];

export const validateSupervisorCreate = [
  validateName("name"),
  validateRequired("supervisorId"),
  validateRequired("password").isLength({ min: 6 }).withMessage("Password must be at least 6 chars"),
  validateRequired("department"),
  handleValidationErrors,
];

export const validateAssign = [
  validateRequired("concernedOfficer"),
  body("supervisor").optional().trim(),
  body("note").optional().trim(),
  handleValidationErrors,
];

export const validateAction = [
  body("note").optional().trim(),
  handleValidationErrors,
];

export const validateProfileUpdate = [
  validateName("name").optional(),
  validatePhone("phone").optional(),
  validateEmail("email").optional(),
  handleValidationErrors,
];
