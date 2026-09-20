import { Router } from 'express';
import * as addresses from '../controllers/addressController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, authorize('customer'));
router.get('/', addresses.list);
router.post('/', addresses.create);
router.delete('/:id', addresses.remove);
export default router;
