import { Request, Response, NextFunction } from "express";
import { body, validationResult, ValidationChain } from "express-validator";

export const validate_event = [
  body("name")
    .if(body("type").equals("track"))
    .isString()
    .isLength({ min: 3, max: 65 })
    .withMessage("Name must be between 3 and 65 characters"),
  body("type")
    .optional()
    .isIn(["track", "identify", "alias", "screen", "page"])
    .withMessage("Invalid event type"),
  body("description")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage("Description cannot be more than 100 characters"),
  body("validation")
    .optional()
    .isObject()
    .withMessage("Validation must be an object"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export function validateUpdateEvent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.body.type) {
    return res.status(400).json({ error: "Type cannot be changed" });
  }
  next();
}

// Define the base validation rules for each field
const basePropertyValidationRules = {
  name: () =>
    body("name")
      .isString()
      .isLength({ min: 3, max: 65 })
      .withMessage("Name must be between 3 and 65 characters"),
  type: () =>
    body("type")
      .isIn(["string", "number", "boolean"])
      .withMessage("Invalid property type"),
  description: () =>
    body("description")
      .isString()
      .isLength({ max: 100 })
      .withMessage("Description cannot be more than 100 characters"),
  validation: () =>
    body("validation").isObject().withMessage("Validation must be an object"),
};

// Middleware to handle validation results
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * Generates validation chains for property creation or update.
 * @param isUpdate - If true, all fields are optional. Otherwise, 'name' and 'type' are required.
 */
const getPropertyValidationChain = (isUpdate: boolean): ValidationChain[] => {
  const chains: ValidationChain[] = [];

  // Name: Required for create, optional for update
  if (!isUpdate) {
    chains.push(basePropertyValidationRules.name()); // Required by default
  } else {
    chains.push(basePropertyValidationRules.name().optional());
  }

  // Type: Required for create, optional for update
  if (!isUpdate) {
    chains.push(basePropertyValidationRules.type()); // Required by default
  } else {
    chains.push(basePropertyValidationRules.type().optional());
  }

  // Description & Validation: Always optional in base rules, so just apply optional()
  chains.push(basePropertyValidationRules.description().optional());
  chains.push(basePropertyValidationRules.validation().optional());

  return chains;
};

// Export your specific validation arrays
export const validate_property = getPropertyValidationChain(false); // For creation
export const validateUpdateProperty = getPropertyValidationChain(true); // For update

export const validate_tracking_plan = [
  body("name")
    .optional()
    .isString()
    .isLength({ min: 3, max: 65 })
    .withMessage("Name must be between 3 and 65 characters"),
  body("description")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage("Description cannot be more than 100 characters"),
  body("events.*.additional_properties")
    .optional()
    .isBoolean()
    .withMessage("additional_properties must be a boolean"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const validateTrackingPlanCreate = [
  body("name")
    .isString()
    .isLength({ min: 3, max: 65 })
    .withMessage("Name must be between 3 and 65 characters"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
