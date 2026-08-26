import axios from 'axios';

async function testAnki() {
  // NOT using Connection: close
  const ankiAxios = axios.create({
    baseURL: 'http://127.0.0.1:8765',
    timeout: 15000
  });

  try {
    const res = await ankiAxios.post('', { action: 'deckNames', version: 6 });
    console.log('Request 1: OK');
    const res2 = await ankiAxios.post('', { action: 'deckNames', version: 6 });
    console.log('Request 2: OK');
    const res3 = await ankiAxios.post('', { action: 'deckNames', version: 6 });
    console.log('Request 3: OK');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testAnki();
