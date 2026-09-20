import { Router } from 'express';
import * as foods from '../controllers/foodController.js';

const router = Router();
router.get('/', foods.list);
// These two must stay above '/:id' or Express would treat "search" as an id.
router.get('/search', foods.searchAll);
router.get('/popular', foods.popular);
router.get('/:id', foods.getOne);
export default router;
