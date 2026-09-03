import keyboard
import threading
import soundcard as sc
import soundfile as sf
import numpy as np
import io
import time
import pyperclip
from PIL import ImageGrab

class SystemListener:
    def __init__(self, config=None):
        """
        Khởi tạo SystemListener với cấu hình tùy chỉnh.
        """
        self.config = config or {}
        
        # Cấu hình phím tắt
        self.screenshot_hotkey = self.config.get('screenshot_hotkey', 'windows+shift+s')
        self.audio_hotkey = self.config.get('audio_hotkey', 'ctrl+shift+a')
        self.text_hotkey = self.config.get('text_hotkey', 'ctrl+e')
        
        # Đăng ký các Callback
        self.on_screenshot_captured = self.config.get('on_screenshot_captured', self._default_screenshot_cb)
        self.on_audio_captured = self.config.get('on_audio_captured', self._default_audio_cb)
        self.on_audio_stream_chunk = self.config.get('on_audio_stream_chunk', self._default_audio_stream_cb)
        self.on_audio_stream_end = self.config.get('on_audio_stream_end', self._default_audio_end_cb)
        self.on_text_captured = self.config.get('on_text_captured', self._default_text_cb)
        self.on_error = self.config.get('on_error', self._default_error_cb)

        # State ghi âm
        self.is_recording = False
        self.audio_thread = None
        
        # Chống gọi trùng lặp
        self.is_waiting_for_snip = False
        self.last_copied_text = ""

    def _default_screenshot_cb(self, data: bytes):
        print(f"[SystemListener] Đã chụp màn hình. Kích thước: {len(data)} bytes")

    def _default_audio_cb(self, data: bytes):
        print(f"[SystemListener] Đã thu âm xong tổng quát. Kích thước: {len(data)} bytes")

    def _default_audio_stream_cb(self, data: bytes):
        pass # Stream data silently by default

    def _default_audio_end_cb(self):
        print(f"[SystemListener] Đã kết thúc stream âm thanh.")

    def _default_text_cb(self, text: str):
        print(f"[SystemListener] Đã copy đoạn text dài: {len(text)} ký tự")
        
    def _default_error_cb(self, error: str):
        print(f"[SystemListener Lỗi] {error}")

    def _wait_for_clipboard_text(self):
        """Chờ hệ điều hành copy xong rồi lấy dữ liệu Text"""
        try:
            # Ngủ 0.1s để Windows kịp đưa dữ liệu vào Clipboard sau khi bấm Ctrl+C (nếu user tự bấm Ctrl+C trước đó)
            time.sleep(0.1)
            
            # Lấy text từ clipboard
            copied_text = pyperclip.paste()
            
            # Chỉ xử lý nếu là text hợp lệ, không rỗng
            if copied_text and isinstance(copied_text, str) and copied_text.strip():
                # Chống trùng lặp: Nếu copy đi copy lại 1 đoạn thì bỏ qua
                if copied_text != self.last_copied_text:
                    self.last_copied_text = copied_text
                    self.on_text_captured(copied_text)
                else:
                    print("[SystemListener] Bỏ qua: Text vừa copy trùng với text trước đó.")
        except Exception as e:
            # Lỗi thường xảy ra nếu dữ liệu copy không phải là text (file, hình ảnh nhị phân...)
            pass

    def capture_text(self):
        """Được gọi khi bấm Ctrl+E"""
        threading.Thread(target=self._wait_for_clipboard_text).start()

    def _wait_for_clipboard_image(self):
        """Luồng chờ đợi người dùng kéo chuột cắt ảnh qua Windows Snipping Tool"""
        try:
            print("\n[SystemListener] Đã mở Snipping Tool. Đang chờ bạn kéo vùng chọn...")
            
            initial_img = ImageGrab.grabclipboard()
            initial_hash = None
            if hasattr(initial_img, 'tobytes'):
                initial_hash = hash(initial_img.tobytes())
                
            timeout = 30 # Đợi thao tác cắt tối đa 30 giây
            start_time = time.time()
            
            while time.time() - start_time < timeout:
                time.sleep(0.5)
                new_img = ImageGrab.grabclipboard()
                
                if hasattr(new_img, 'tobytes'):
                    current_hash = hash(new_img.tobytes())
                    if current_hash != initial_hash:
                        img_byte_arr = io.BytesIO()
                        new_img.save(img_byte_arr, format='PNG')
                        img_byte_arr.seek(0)
                        
                        self.on_screenshot_captured(img_byte_arr.read())
                        print("[SystemListener] Bắt được ảnh từ Snipping Tool thành công!")
                        return
                        
            print("[SystemListener] Đã huỷ chờ: Hết 30 giây mà không thấy cắt ảnh.")
        except Exception as e:
            self.on_error(f"Lỗi khi xử lý Snipping Tool: {e}")
        finally:
            self.is_waiting_for_snip = False

    def take_screenshot(self):
        """Được gọi khi bấm Windows + Shift + S."""
        if self.is_waiting_for_snip:
            return
            
        self.is_waiting_for_snip = True
        threading.Thread(target=self._wait_for_clipboard_image).start()

    def _audio_record_task(self):
        try:
            self.is_recording = True
            self.audio_frames = []
            
            speaker = sc.default_speaker()
            mic = sc.get_microphone(speaker.id, include_loopback=True)
            
            # Khống chế thời gian tối đa: 60 giây (1 phút)
            MAX_DURATION = 60
            start_time = time.time()
            
            with mic.recorder(samplerate=44100) as recorder:
                while self.is_recording:
                    if time.time() - start_time >= MAX_DURATION:
                        print("\n[SystemListener] Đã đạt giới hạn 1 phút ghi âm. Tự động dừng!")
                        self.is_recording = False
                        break
                        
                    # Thu theo từng chunk
                    data = recorder.record(numframes=2048) # numpy array float32
                    
                    # Lưu lại frame để tạo file tổng lúc cuối
                    self.audio_frames.append(data)
                    
                    # Chuyển đổi numpy array float32 sang int16
                    int_data = (data * 32767).astype(np.int16)
                    
                    # Chuyển đổi numpy array thành bytes và gửi luôn qua WebSocket
                    self.on_audio_stream_chunk(int_data.tobytes())
                    
            # Báo hiệu kết thúc ghi âm cho WebSocket và nhận về text
            text_result = self.on_audio_stream_end() or ""
            
            # Khôi phục cơ chế tạo file tổng cuối
            if self.audio_frames:
                audio_data = np.concatenate(self.audio_frames, axis=0)
                mem_file = io.BytesIO()
                sf.write(mem_file, audio_data, 44100, format='WAV', subtype='PCM_16')
                mem_file.seek(0)
                
                # Gọi callback để gửi file tổng VÀ text nhận được
                try:
                    self.on_audio_captured(mem_file.read(), text_result)
                except TypeError:
                    # Nếu callback cũ không nhận tham số thứ 2
                    self.on_audio_captured(mem_file.read())
                
        except Exception as e:
            self.is_recording = False
            self.on_error(f"Lỗi khi thu âm loa: {e}")

    def toggle_audio(self):
        if not self.is_recording:
            self.audio_thread = threading.Thread(target=self._audio_record_task)
            self.audio_thread.start()
            print("\n[SystemListener] Đang ghi âm (Streaming)... Bấm lại phím tắt để dừng.")
        else:
            self.is_recording = False
            print("\n[SystemListener] Đang kết thúc ghi âm...")

    def start(self, block=True):
        keyboard.add_hotkey(self.screenshot_hotkey, self.take_screenshot)
        keyboard.add_hotkey(self.audio_hotkey, self.toggle_audio)
        keyboard.add_hotkey(self.text_hotkey, self.capture_text)
        
        print(f"=====================================")
        print(f"[SystemListener] Đã khởi động!")
        print(f" - Phím chụp ảnh: {self.screenshot_hotkey}")
        print(f" - Phím thu âm:  {self.audio_hotkey}")
        print(f" - Phím gửi text (từ clipboard): {self.text_hotkey}")
        print(f" - Bấm 'esc' để thoát hoàn toàn.")
        print(f"=====================================")
        
        if block:
            keyboard.wait('esc')
            
    def stop(self):
        keyboard.unhook_all()
        if self.is_recording:
            self.is_recording = False
