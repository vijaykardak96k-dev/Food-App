import { Router } from 'express';
import * as cart from '../controllers/cartController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, authorize('customer'));
router.get('/', cart.getCart);
router.post('/', cart.addItem);
router.delete('/', cart.clearCart);
router.put('/:id', cart.updateItem);
router.delete('/:id', cart.removeItem);
export default router;
