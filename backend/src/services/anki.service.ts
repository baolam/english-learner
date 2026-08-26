import axios from 'axios';

const ANKI_CONNECT_URL = 'http://127.0.0.1:8765';

const ankiAxios = axios.create({
  baseURL: ANKI_CONNECT_URL,
  headers: { 'Connection': 'close' },
  timeout: 15000
});

export async function invoke(action: string, params: object = {}, retries = 3): Promise<any> {
  try {
    const response = await ankiAxios.post('', { action, version: 6, params });
    const data = response.data;
    
    if (Object.keys(data).length !== 2) {
      throw new Error('response has an unexpected number of fields');
    }
    if (!('error' in data)) {
      throw new Error('response is missing required error field');
    }
    if (!('result' in data)) {
      throw new Error('response is missing required result field');
    }
    if (data.error !== null) {
      throw new Error(data.error);
    }
    
    return data.result;
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET' || error.code === 'ECONNABORTED') {
      if (retries > 0 && error.code === 'ECONNRESET') {
        await new Promise(res => setTimeout(res, 150));
        return invoke(action, params, retries - 1);
      }
      throw new Error("Lỗi: Không thể kết nối tới Anki. Hãy chắc chắn rằng Anki đang mở và add-on AnkiConnect đã được cài đặt.");
    }
    throw error;
  }
}
