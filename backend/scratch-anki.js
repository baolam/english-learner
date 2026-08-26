import axios from 'axios';
import http from 'http';

async function testAnki() {
  const ankiAxios = axios.create({
    baseURL: 'http://127.0.0.1:8765',
    httpAgent: new http.Agent({ keepAlive: true }),
  });

  try {
    console.time('is:new');
    const res = await ankiAxios.post('', {
      action: 'findCards',
      version: 6,
      params: { query: 'is:new' }
    });
    console.timeEnd('is:new');
    console.log('is:new count:', res.data.result?.length);
    
    console.time('is:due');
    const resDue = await ankiAxios.post('', {
      action: 'findCards',
      version: 6,
      params: { query: 'is:due' }
    });
    console.timeEnd('is:due');
    console.log('is:due count:', resDue.data.result?.length);

    console.time('deckNames');
    const resAll = await ankiAxios.post('', {
      action: 'deckNames',
      version: 6
    });
    console.timeEnd('deckNames');
    console.log('deck count:', resAll.data.result?.length);
    
  } catch (err) {
    console.error(err.message);
  }
}

testAnki();
