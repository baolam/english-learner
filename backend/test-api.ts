import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  console.log('Bắt đầu test các API của LingoAnki Backend...\n');

  // 1. Test Health Check
  try {
    console.log('1. [GET] /api/health');
    const healthRes = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Thành công:', healthRes.data);
  } catch (error: any) {
    console.error('❌ Lỗi:', error.message);
  }
  console.log('-----------------------------------');

  // 2. Test AI Story Generation
  try {
    console.log('2. [POST] /api/ai/generate-story');
    const words = ['apple', 'banana', 'coconut'];
    const aiRes = await axios.post(`${BASE_URL}/ai/generate-story`, { words });
    console.log('✅ Thành công:');
    console.log(aiRes.data);
  } catch (error: any) {
    console.error('❌ Lỗi:', error.response?.data || error.message);
  }
  console.log('-----------------------------------');

  // 3. Test Anki Dashboard (Yêu cầu Anki + AnkiConnect đang mở)
  try {
    console.log('3. [GET] /api/anki/dashboard');
    const dashboardRes = await axios.get(`${BASE_URL}/anki/dashboard`);
    console.log('✅ Thành công:');
    console.log('- Số lượng deck:', dashboardRes.data.decks?.length);
    console.log('- Số lượng thẻ mới (New):', dashboardRes.data.newCards?.length);
    console.log('- Số lượng thẻ đến hạn (Due):', dashboardRes.data.dueCards?.length);
  } catch (error: any) {
    console.error('❌ Lỗi (AnkiConnect có đang mở không?):', error.response?.data || error.message);
  }
  console.log('-----------------------------------');

  // 4. Test Add Note vào Anki (Yêu cầu Anki + AnkiConnect đang mở)
  try {
    console.log('4. [POST] /api/anki/add-note');
    const noteData = {
      deckName: 'Default',
      modelName: 'Basic',
      front: 'Serendipity (test)',
      back: 'Sự tình cờ may mắn',
      context: 'I experienced a moment of serendipity when I found my lost keys.'
    };
    
    // Lưu ý: Nếu deck 'Default' hoặc model 'Basic' không tồn tại trên Anki của bạn, API này có thể lỗi.
    const addNoteRes = await axios.post(`${BASE_URL}/anki/add-note`, noteData);
    console.log('✅ Thành công:', addNoteRes.data);
  } catch (error: any) {
    console.error('❌ Lỗi (Có thể do trùng lặp hoặc thiếu deck/model):', error.response?.data || error.message);
  }
  console.log('\nHoàn tất test API!');
}

runTests();
