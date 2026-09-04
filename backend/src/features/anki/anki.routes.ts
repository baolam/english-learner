import { Router } from 'express';
import { AnkiController } from './anki.controller';

const router = Router();

// 1. Lấy ra thẻ nội dung
router.post('/cards-info', AnkiController.getCardsInfo);

// 2. Lấy ra deck
router.get('/decks', AnkiController.getDecks);

// 3. Lấy trạng thái từ
router.get('/word-status', AnkiController.getWordStatus);

// 4. Lấy kho các từ cần học theo deck
router.get('/learn', AnkiController.getCardsToLearn);

// 5. Lấy kho các từ cần ôn lại theo deck
router.get('/review', AnkiController.getCardsToReview);

export default router;
