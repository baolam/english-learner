import React, { useState } from 'react';
import axios from 'axios';
import { PlusCircle } from 'lucide-react';
import { API_BASE } from '../config';

export function ReadingView() {
  const [targetWords, setTargetWords] = useState('serendipity, ephemeral, ubiquitous');
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState('');
  const [wordMeaning, setWordMeaning] = useState(''); 
  const [addingToAnki, setAddingToAnki] = useState(false);

  const generateStory = async () => {
    setLoading(true);
    try {
      const words = targetWords.split(',').map(w => w.trim());
      const res = await axios.post(`${API_BASE}/ai/generate-story`, { words });
      setStory(res.data.story);
    } catch (err) {
      console.error(err);
      alert('Failed to generate story. Make sure backend is running and Gemini API key is set.');
    } finally {
      setLoading(false);
    }
  };

  const handleWordClick = (word: string) => {
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=_`~()"]/g, '').toLowerCase();
    setSelectedWord(cleanWord);
    setWordMeaning(`Definition for ${cleanWord}...`);
  };

  const addToAnki = async () => {
    setAddingToAnki(true);
    try {
      await axios.post(`${API_BASE}/anki/add-note`, {
        deckName: 'Default',
        modelName: 'Basic',
        front: selectedWord,
        back: wordMeaning,
        context: story.substring(0, 100) + '...'
      });
      alert(`Added ${selectedWord} to Anki!`);
      setSelectedWord('');
    } catch (err) {
      console.error(err);
      alert('Failed to add to Anki. Make sure Anki is running with AnkiConnect.');
    } finally {
      setAddingToAnki(false);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium mb-4">Generate Reading Passage</h2>
          <div className="flex space-x-2">
            <input 
              type="text" 
              className="flex-1 border-gray-300 rounded-md shadow-sm border p-2 focus:ring-blue-500 focus:border-blue-500"
              value={targetWords}
              onChange={(e) => setTargetWords(e.target.value)}
              placeholder="Enter comma-separated words..."
            />
            <button 
              onClick={generateStory} 
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>

        {story && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 prose max-w-none">
            {story.split(/\s+/).map((word, index) => (
              <span 
                key={index} 
                className="cursor-pointer hover:bg-yellow-200 hover:text-black rounded px-0.5 transition-colors"
                onClick={() => handleWordClick(word)}
              >
                {word}{' '}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-6">
          <h2 className="text-lg font-medium mb-4">Vocabulary Panel</h2>
          {selectedWord ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-blue-600">{selectedWord}</h3>
                <p className="text-gray-600 mt-2">{wordMeaning}</p>
                <textarea 
                  className="w-full border p-2 rounded mt-2 text-sm text-gray-700" 
                  value={wordMeaning}
                  onChange={(e) => setWordMeaning(e.target.value)}
                  placeholder="Edit meaning..."
                  rows={3}
                />
              </div>
              <button 
                onClick={addToAnki}
                disabled={addingToAnki}
                className="w-full flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                {addingToAnki ? 'Adding...' : 'Add to Anki'}
              </button>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Click on any word in the passage to see its meaning and add it to Anki.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
