import { Router } from 'express';
import * as termController from './term.controller';

const router = Router();

router.get('/', termController.getAllTerms);
router.get('/:id', termController.getTermById);
router.post('/', termController.createTerm);
router.put('/:id', termController.updateTerm);
router.delete('/:id', termController.deleteTerm);

export default router;
