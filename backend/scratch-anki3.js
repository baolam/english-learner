import axios from 'axios';

async function testAnki() {
  const ankiAxios = axios.create({
    baseURL: 'http://127.0.0.1:8765',
    headers: { 'Connection': 'close' },
  });

  const delay = ms => new Promise(res => setTimeout(res, ms));

  try {
    await ankiAxios.post('', { action: 'deckNames', version: 6 });
    console.log('Request 1: OK');
    await delay(100);
    await ankiAxios.post('', { action: 'deckNames', version: 6 });
    console.log('Request 2: OK');
    await delay(100);
    await ankiAxios.post('', { action: 'deckNames', version: 6 });
    console.log('Request 3: OK');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testAnki();
