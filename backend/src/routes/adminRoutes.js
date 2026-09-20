import { Router } from 'express';
import * as admin from '../controllers/adminController.js';
import * as categories from '../controllers/categoryController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, authorize('admin'));

router.get('/dashboard', admin.dashboard);

router.get('/users', admin.listUsers);
router.get('/users/:id', admin.getUser);
router.put('/users/:id/status', admin.setUserStatus);

router.get('/restaurants', admin.listRestaurants);
router.put('/restaurants/:id/status', admin.setRestaurantStatus);

router.get('/orders', admin.listOrders);
router.get('/orders/:id', admin.getOrder);

router.post('/categories', categories.create);
router.put('/categories/:id', categories.update);
router.delete('/categories/:id', categories.remove);
export default router;
