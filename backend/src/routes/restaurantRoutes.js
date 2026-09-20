import { Router } from 'express';
import * as restaurants from '../controllers/restaurantController.js';

const router = Router();
router.get('/', restaurants.list);
router.get('/:id', restaurants.getOne);
export default router;
