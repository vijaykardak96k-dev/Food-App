import { Router } from 'express';
import * as categories from '../controllers/categoryController.js';

const router = Router();
router.get('/', categories.list);
export default router;
