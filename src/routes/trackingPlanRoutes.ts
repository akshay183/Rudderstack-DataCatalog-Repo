import { Router } from 'express';
import {
    create_tracking_plan,
    get_all_tracking_plans,
    get_tracking_plan_by_id,
    update_tracking_plan,
    delete_tracking_plan,
    upsert_event_to_tracking_plan,
} from '../controllers/trackingPlanController';
import { validate_tracking_plan } from '../middleware/validationMiddleware';

const router = Router();

router.post('/', validate_tracking_plan, create_tracking_plan);
router.get('/', get_all_tracking_plans);
router.get('/:id', get_tracking_plan_by_id);
router.put('/:id', validate_tracking_plan, update_tracking_plan);
router.delete('/:id', delete_tracking_plan);
router.patch('/event', upsert_event_to_tracking_plan);


export default router;
