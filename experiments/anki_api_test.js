async function invoke(action, params = {}) {
    try {
        // Node.js >= 18 có sẵn hàm fetch tích hợp
        const response = await fetch('http://localhost:8765', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action, version: 6, params })
        });
        
        const data = await response.json();
        
        if (Object.keys(data).length !== 2) {
            throw new Error('response has an unexpected number of fields');
        }
        if (!data.hasOwnProperty('error')) {
            throw new Error('response is missing required error field');
        }
        if (!data.hasOwnProperty('result')) {
            throw new Error('response is missing required result field');
        }
        if (data.error) {
            throw new Error(data.error);
        }
        
        return data.result;
    } catch (error) {
        // Bắt lỗi khi không thể kết nối tới cổng 8765 (Anki chưa mở hoặc chưa cài AnkiConnect)
        if (error.cause && error.cause.code === 'ECONNREFUSED') {
            console.error("Lỗi: Không thể kết nối tới Anki. Hãy chắc chắn rằng Anki đang mở và add-on AnkiConnect đã được cài đặt.");
            return null;
        }
        console.error("Lỗi:", error.message);
        return null;
    }
}

async function testAnkiApi() {
    console.log("Bắt đầu test Anki API bằng Node.js...\n");

    // 1. Lấy danh sách các decks
    const decks = await invoke('deckNames');
    if (!decks) return;

    console.log("--- Danh sách các Decks ---");
    console.log(decks);

    if (decks.length === 0) {
        console.log("Không tìm thấy deck nào.");
        return;
    }

    // Chọn một deck để test (hoặc bạn có thể đổi tên deck ở đây)
    let testDeck = decks[0];
    if (testDeck === "Default" && decks.length > 1) {
        testDeck = decks[1]; // Bỏ qua deck Default nếu có deck khác
    }

    console.log(`\n=== Đang test trên deck: ${testDeck} ===`);

    // 2. Lấy các thẻ chưa học (is:new)
    const newCardsQuery = `deck:"${testDeck}" is:new`;
    const newCards = await invoke('findCards', { query: newCardsQuery });
    
    console.log(`\n--- Các thẻ CHƯA HỌC (mới) trong '${testDeck}' ---`);
    console.log(`Query: ${newCardsQuery}`);
    console.log(`Số lượng thẻ chưa học: ${newCards ? newCards.length : 0}`);
    if (newCards && newCards.length > 0) {
        const sampleIds = newCards.slice(0, 5);
        console.log(`ID của một số thẻ: ${sampleIds.join(', ')}${newCards.length > 5 ? '...' : ''}`);
    }

    // 3. Lấy các thẻ cần ôn tập (is:due)
    const dueCardsQuery = `deck:"${testDeck}" is:due`;
    const dueCards = await invoke('findCards', { query: dueCardsQuery });
    
    console.log(`\n--- Các thẻ CẦN ÔN (due) trong '${testDeck}' ---`);
    console.log(`Query: ${dueCardsQuery}`);
    console.log(`Số lượng thẻ cần ôn: ${dueCards ? dueCards.length : 0}`);
    if (dueCards && dueCards.length > 0) {
        const sampleIds = dueCards.slice(0, 5);
        console.log(`ID của một số thẻ: ${sampleIds.join(', ')}${dueCards.length > 5 ? '...' : ''}`);
    }

    // Gộp ID để test lấy thông tin
    let sampleCardIds = [];
    if (newCards && newCards.length > 0) {
        sampleCardIds.push(...newCards.slice(0, 3));
    }
    if (dueCards && dueCards.length > 0 && sampleCardIds.length < 3) {
        sampleCardIds.push(...dueCards.slice(0, 3 - sampleCardIds.length));
    }

    if (sampleCardIds.length > 0) {
        // 4. Lấy nội dung của 1 thẻ
        const cardId = sampleCardIds[0];
        console.log(`\n--- Lấy nội dung của 1 thẻ (ID: ${cardId}) ---`);
        const singleCardInfo = await invoke('cardsInfo', { cards: [cardId] });
        if (singleCardInfo && singleCardInfo.length > 0) {
            console.log("Thông tin chi tiết:");
            console.log(JSON.stringify(singleCardInfo[0], null, 2));
        }

        // 5. Lấy nội dung của nhiều thẻ (n thẻ)
        const n = sampleCardIds.length;
        if (n > 1) {
            console.log(`\n--- Lấy nội dung của ${n} thẻ (IDs: ${sampleCardIds.join(', ')}) ---`);
            const multipleCardsInfo = await invoke('cardsInfo', { cards: sampleCardIds });
            if (multipleCardsInfo) {
                multipleCardsInfo.forEach((info, i) => {
                    console.log(`\n[Thẻ ${i + 1} - ID: ${info.cardId}] Các trường dữ liệu (fields):`);
                    console.log(JSON.stringify(info.fields, null, 2));
                });
            }
        }
    } else {
        console.log("\nKhông có thẻ mới hoặc thẻ cần ôn nào trong deck này để test lấy nội dung.");
    }
}

testAnkiApi();
