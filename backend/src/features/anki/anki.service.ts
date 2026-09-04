import axios from 'axios';

const ANKI_CONNECT_URL = process.env.ANKI_CONNECT_URL || 'http://127.0.0.1:8765';

export class AnkiService {
  /**
   * Helper function to invoke AnkiConnect actions
   */
  private static async invoke(action: string, params: any = {}) {
    try {
      const response = await axios.post(ANKI_CONNECT_URL, {
        action,
        version: 6,
        params,
      });

      if (Object.prototype.hasOwnProperty.call(response.data, 'error') && response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data.result;
    } catch (error: any) {
      console.error(`AnkiConnect Error [${action}]:`, error.message);
      throw error;
    }
  }

  /**
   * 1. Lấy ra thẻ nội dung (Get cards info)
   * @param cards array of card IDs
   */
  public static async getCardsInfo(cards: number[]) {
    return this.invoke('cardsInfo', { cards });
  }
  
  /**
   * Get notes info 
   */
  public static async getNotesInfo(notes: number[]) {
    return this.invoke('notesInfo', { notes });
  }

  /**
   * 2. Lấy ra deck (Get deck names)
   */
  public static async getDeckNames() {
    return this.invoke('deckNames');
  }

  /**
   * 3. Lấy trạng thái từ (Get word status by searching notes/cards)
   * @param word The word to search for
   */
  public static async getWordStatus(word: string) {
    // Find cards containing the word
    const cards = await this.invoke('findCards', { query: `"${word}"` });
    if (!cards || cards.length === 0) {
      return null;
    }
    // Get info for these cards to see their status (queue, interval, etc.)
    return this.invoke('cardsInfo', { cards });
  }

  /**
   * 4. Lấy kho các từ cần học theo deck (Get new cards to learn by deck)
   * @param deckName Name of the deck
   */
  public static async getCardsToLearn(deckName: string) {
    const query = `deck:"${deckName}" is:new`;
    const cards = await this.invoke('findCards', { query });
    if (!cards || cards.length === 0) {
      return [];
    }
    return this.invoke('cardsInfo', { cards });
  }

  /**
   * 5. Lấy kho các từ cần ôn lại theo deck (Get cards to review by deck)
   * @param deckName Name of the deck
   */
  public static async getCardsToReview(deckName: string) {
    // is:due -> due for review, is:learn -> currently in learning queue
    const query = `deck:"${deckName}" (is:due OR is:learn)`;
    const cards = await this.invoke('findCards', { query });
    if (!cards || cards.length === 0) {
      return [];
    }
    return this.invoke('cardsInfo', { cards });
  }
}
