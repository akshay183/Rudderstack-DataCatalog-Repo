import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validate_event = [
    body('name').if(body('type').equals('track')).isString().isLength({ min: 3, max: 65 }).withMessage('Name must be between 3 and 65 characters'),
    body('type').isIn(['track', 'identify', 'alias', 'screen', 'page']).withMessage('Invalid event type'),
    body('description').optional().isString().isLength({ max: 100 }).withMessage('Description cannot be more than 100 characters'),
    body('validation').optional().isObject().withMessage('Validation must be an object'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validate_property = [
    body('name').isString().isLength({ min: 3, max: 65 }).withMessage('Name must be between 3 and 65 characters'),
    body('type').isIn(['string', 'number', 'boolean']).withMessage('Invalid property type'),
    body('description').optional().isString().isLength({ max: 100 }).withMessage('Description cannot be more than 100 characters'),
    body('validation').optional().isObject().withMessage('Validation must be an object'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validate_tracking_plan = [
    body('name').isString().isLength({ min: 3, max: 65 }).withMessage('Name must be between 3 and 65 characters'),
    body('description').optional().isString().isLength({ max: 100 }).withMessage('Description cannot be more than 100 characters'),
    body('events.*.additional_properties').optional().isBoolean().withMessage('additional_properties must be a boolean'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
