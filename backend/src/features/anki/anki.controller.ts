import { Request, Response } from 'express';
import { AnkiService } from './anki.service';
import { asyncHandler } from '../../utils/async-handler';
import { BadRequestError } from '../../errors/app-error';

export class AnkiController {
  public static getDecks = asyncHandler(async (req: Request, res: Response) => {
    const decks = await AnkiService.getDeckNames();
    res.json({ success: true, data: decks });
  });

  public static getCardsInfo = asyncHandler(async (req: Request, res: Response) => {
    const cards = req.body.cards;
    if (!Array.isArray(cards)) {
      throw new BadRequestError('cards must be an array of IDs');
    }
    const info = await AnkiService.getCardsInfo(cards);
    res.json({ success: true, data: info });
  });

  public static getWordStatus = asyncHandler(async (req: Request, res: Response) => {
    const word = req.query.word as string;
    if (!word) {
      throw new BadRequestError('word query parameter is required');
    }
    const status = await AnkiService.getWordStatus(word);
    res.json({ success: true, data: status });
  });

  public static getCardsToLearn = asyncHandler(async (req: Request, res: Response) => {
    const deckName = req.query.deck as string;
    if (!deckName) {
      throw new BadRequestError('deck query parameter is required');
    }
    const cards = await AnkiService.getCardsToLearn(deckName);
    res.json({ success: true, data: cards });
  });

  public static getCardsToReview = asyncHandler(async (req: Request, res: Response) => {
    const deckName = req.query.deck as string;
    if (!deckName) {
      throw new BadRequestError('deck query parameter is required');
    }
    const cards = await AnkiService.getCardsToReview(deckName);
    res.json({ success: true, data: cards });
  });
}
