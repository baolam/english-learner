import { Router } from 'express';
import healthRoutes from './health.routes';
import ankiRoutes from './anki.routes';
import aiRoutes from './ai.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/anki', ankiRoutes);
router.use('/ai', aiRoutes);

export default router;
