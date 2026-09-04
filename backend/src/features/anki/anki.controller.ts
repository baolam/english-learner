import { Request, Response } from 'express';
import { AnkiService } from './anki.service';

export class AnkiController {
  public static async getDecks(req: Request, res: Response) {
    try {
      const decks = await AnkiService.getDeckNames();
      res.json({ success: true, data: decks });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async getCardsInfo(req: Request, res: Response) {
    try {
      const cards = req.body.cards;
      if (!Array.isArray(cards)) {
        return res.status(400).json({ success: false, error: 'cards must be an array of IDs' });
      }
      const info = await AnkiService.getCardsInfo(cards);
      res.json({ success: true, data: info });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async getWordStatus(req: Request, res: Response) {
    try {
      const word = req.query.word as string;
      if (!word) {
        return res.status(400).json({ success: false, error: 'word query parameter is required' });
      }
      const status = await AnkiService.getWordStatus(word);
      res.json({ success: true, data: status });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async getCardsToLearn(req: Request, res: Response) {
    try {
      const deckName = req.query.deck as string;
      if (!deckName) {
        return res.status(400).json({ success: false, error: 'deck query parameter is required' });
      }
      const cards = await AnkiService.getCardsToLearn(deckName);
      res.json({ success: true, data: cards });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  public static async getCardsToReview(req: Request, res: Response) {
    try {
      const deckName = req.query.deck as string;
      if (!deckName) {
        return res.status(400).json({ success: false, error: 'deck query parameter is required' });
      }
      const cards = await AnkiService.getCardsToReview(deckName);
      res.json({ success: true, data: cards });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
