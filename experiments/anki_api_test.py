import json
import requests

def invoke(action, **params):
    """Gửi request tới AnkiConnect API"""
    requestJson = json.dumps({'action': action, 'params': params, 'version': 6})
    try:
        response = requests.post('http://localhost:8765', data=requestJson).json()
    except requests.exceptions.ConnectionError:
        print("Lỗi: Không thể kết nối tới Anki. Hãy chắc chắn rằng Anki đang mở và add-on AnkiConnect đã được cài đặt.")
        return None

    if len(response) != 2:
        raise Exception('response has an unexpected number of fields')
    if 'error' not in response:
        raise Exception('response is missing required error field')
    if 'result' not in response:
        raise Exception('response is missing required result field')
    if response['error'] is not None:
        raise Exception(response['error'])
    return response['result']

def test_anki_api():
    print("Bắt đầu test Anki API...\n")
    
    # 1. Lấy danh sách các decks
    decks = invoke('deckNames')
    if decks is None:
        return
        
    print("--- Danh sách các Decks ---")
    print(decks)
    
    if not decks:
        print("Không tìm thấy deck nào.")
        return
        
    # Chọn một deck để test (hoặc bạn có thể đổi tên deck ở đây)
    # Ví dụ: test_deck = "English"
    test_deck = decks[0] 
    if test_deck == "Default" and len(decks) > 1:
        test_deck = decks[1]
        
    print(f"\n=== Đang test trên deck: {test_deck} ===")
    
    # 2. Lấy các thẻ chưa học (is:new)
    # Cú pháp tìm kiếm Anki: deck:"Tên Deck" is:new
    new_cards_query = f'deck:"{test_deck}" is:new'
    new_cards = invoke('findCards', query=new_cards_query)
    
    print(f"\n--- Các thẻ CHƯA HỌC (mới) trong '{test_deck}' ---")
    print(f"Query: {new_cards_query}")
    print(f"Số lượng thẻ chưa học: {len(new_cards)}")
    if new_cards:
        print(f"ID của một số thẻ: {new_cards[:5]}{'...' if len(new_cards) > 5 else ''}")
        # Bạn có thể dùng action 'cardsInfo' để lấy nội dung chi tiết của các thẻ này
        # info = invoke('cardsInfo', cards=new_cards[:1])
        # print("Chi tiết thẻ đầu tiên:", json.dumps(info[0], indent=2, ensure_ascii=False))
    
    # 3. Lấy các thẻ cần ôn tập (is:due)
    # Cú pháp tìm kiếm Anki: deck:"Tên Deck" is:due
    due_cards_query = f'deck:"{test_deck}" is:due'
    due_cards = invoke('findCards', query=due_cards_query)
    
    print(f"\n--- Các thẻ CẦN ÔN (due) trong '{test_deck}' ---")
    print(f"Query: {due_cards_query}")
    print(f"Số lượng thẻ cần ôn: {len(due_cards)}")
    if due_cards:
        print(f"ID của một số thẻ: {due_cards[:5]}{'...' if len(due_cards) > 5 else ''}")
        
    # Lấy một vài ID thẻ (nếu có) để test chức năng lấy thông tin thẻ
    sample_card_ids = []
    if new_cards:
        sample_card_ids.extend(new_cards[:3])
    if due_cards and len(sample_card_ids) < 3:
        sample_card_ids.extend(due_cards[:3-len(sample_card_ids)])
        
    if sample_card_ids:
        # 4. Lấy nội dung của 1 thẻ
        card_id = sample_card_ids[0]
        print(f"\n--- Lấy nội dung của 1 thẻ (ID: {card_id}) ---")
        single_card_info = invoke('cardsInfo', cards=[card_id])
        if single_card_info:
            print("Thông tin chi tiết:")
            print(json.dumps(single_card_info[0], indent=2, ensure_ascii=False))
            
        # 5. Lấy nội dung của nhiều thẻ (n thẻ)
        n = len(sample_card_ids)
        if n > 1:
            print(f"\n--- Lấy nội dung của {n} thẻ (IDs: {sample_card_ids}) ---")
            multiple_cards_info = invoke('cardsInfo', cards=sample_card_ids)
            if multiple_cards_info:
                for i, info in enumerate(multiple_cards_info):
                    print(f"\n[Thẻ {i+1} - ID: {info['cardId']}] Các trường dữ liệu (fields):")
                    # In ra phần 'fields' để xem nội dung mặt trước/sau của thẻ
                    print(json.dumps(info['fields'], indent=2, ensure_ascii=False))
    else:
        print("\nKhông có thẻ mới hoặc thẻ cần ôn nào trong deck này để test lấy nội dung.")

if __name__ == '__main__':
    test_anki_api()
