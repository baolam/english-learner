import { Request, Response } from 'express';
import { invoke } from '../services/anki.service';

export const getMediaFile = async (req: Request, res: Response) => {
  try {
    const data = await invoke('retrieveMediaFile', { filename: req.params.filename });
    if (data) {
      const buffer = Buffer.from(data as string, 'base64');
      const filename = req.params.filename.toLowerCase();
      if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) res.type('image/jpeg');
      else if (filename.endsWith('.png')) res.type('image/png');
      else if (filename.endsWith('.gif')) res.type('image/gif');
      else if (filename.endsWith('.mp3')) res.type('audio/mpeg');
      else if (filename.endsWith('.wav')) res.type('audio/wav');
      res.send(buffer);
    } else {
      res.status(404).send('Not found');
    }
  } catch (error: any) {
    res.status(500).send(error.message);
  }
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const initData = await invoke('multi', {
      actions: [
        { action: 'findCards', params: { query: 'is:new' } },
        { action: 'findCards', params: { query: 'is:due' } },
        { action: 'deckNames' }
      ]
    });

    const newCardIds = (initData[0] || []).slice(0, 15);
    const dueCardIds = (initData[1] || []).slice(0, 15);
    const decks = initData[2] || [];

    let newCards: any[] = [];
    let dueCards: any[] = [];

    const infoActions: any[] = [];
    if (newCardIds.length > 0) infoActions.push({ action: 'cardsInfo', params: { cards: newCardIds } });
    if (dueCardIds.length > 0) infoActions.push({ action: 'cardsInfo', params: { cards: dueCardIds } });

    if (infoActions.length > 0) {
      const infoData = await invoke('multi', { actions: infoActions });
      let infoIndex = 0;
      
      const formatCards = (cardsInfo: any[]) => {
        return cardsInfo.map((c: any) => {
          const fields = c.fields || {};
          let frontText = 'Unknown';
          let backText = '';
          
          if (fields.Front) frontText = fields.Front.value;
          else if (fields.English) frontText = fields.English.value;
          else {
            const firstField = Object.values(fields).find((f: any) => f.order === 0) as any;
            if (firstField) frontText = firstField.value;
          }

          if (fields.Back) backText = fields.Back.value;
          else if (fields.Transcription) backText = fields.Transcription.value;
          else {
            const secondField = Object.values(fields).find((f: any) => f.order === 1 || f.order === 2) as any;
            if (secondField) backText = secondField.value;
          }

          return {
            id: c.cardId,
            deckName: c.deckName,
            front: frontText,
            back: backText,
            answer: c.answer,
            css: c.css
          };
        });
      };

      if (newCardIds.length > 0) {
        newCards = formatCards(infoData[infoIndex]);
        infoIndex++;
      }
      if (dueCardIds.length > 0) {
        dueCards = formatCards(infoData[infoIndex]);
      }
    }

    res.json({ 
      success: true, 
      decks,
      newCards,
      dueCards
    });
  } catch (error: any) {
    console.error('Error connecting to Anki:', error);
    res.status(500).json({ success: false, error: error.message || 'Could not connect to AnkiConnect. Is Anki running?' });
  }
};

export const addNote = async (req: Request, res: Response) => {
  // API tạm thời bị vô hiệu hoá theo yêu cầu của user
  return res.status(503).json({ success: false, error: 'API is disabled temporarily.' });
};
