import { Router } from 'express';
import * as orders from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, authorize('customer'));
router.post('/', orders.create);
router.get('/', orders.list);
router.get('/:id', orders.getOne);
export default router;
