import { Router } from 'express';
import { generateStory } from '../controllers/ai.controller';

const router = Router();

router.post('/generate-story', generateStory);

export default router;
