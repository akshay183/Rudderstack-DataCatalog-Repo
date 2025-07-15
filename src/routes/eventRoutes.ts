import { Router } from 'express';
import { create_event, get_all_events, get_event_by_id, update_event, delete_event } from '../controllers/eventController';
import { validate_event } from '../middleware/validationMiddleware';

const router = Router();

router.post('/', validate_event, create_event);
router.get('/', get_all_events);
router.get('/:id', get_event_by_id);
router.put('/:id', validate_event, update_event);
router.delete('/:id', delete_event);

export default router;
