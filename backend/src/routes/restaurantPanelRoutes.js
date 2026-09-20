import { Router } from 'express';
import * as panel from '../controllers/restaurantPanelController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';

const router = Router();
router.use(authenticate, authorize('restaurant'));

router.get('/dashboard', panel.dashboard);

router.get('/foods', panel.listFoods);
router.post('/foods', uploadImage, panel.createFood);
router.put('/foods/:id', uploadImage, panel.updateFood);
router.patch('/foods/:id/availability', panel.setFoodAvailability);
router.delete('/foods/:id', panel.deleteFood);

router.get('/orders', panel.listOrders);
router.put('/orders/:id/status', panel.updateOrderStatus);
export default router;
