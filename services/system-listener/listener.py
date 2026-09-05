import sys
import keyboard
import threading
import soundcard as sc
import soundfile as sf
import numpy as np
import io
import time
import pyperclip
import warnings
from collections import deque
from PIL import ImageGrab
from vad import SileroVAD

# Ẩn các cảnh báo đứt đoạn âm thanh không đáng ngại từ soundcard
warnings.filterwarnings("ignore", category=sc.SoundcardRuntimeWarning)

# Cấu hình encoding UTF-8 cho sys.stdout/sys.stderr
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass
if hasattr(sys.stderr, 'reconfigure'):
    try:
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

class SystemListener:
    def __init__(self, config=None):
        """
        Khởi tạo SystemListener với cấu hình tùy chỉnh.
        """
        self.config = config or {}
        
        # Cấu hình phím tắt
        self.screenshot_hotkey = self.config.get('screenshot_hotkey', 'windows+shift+s')
        self.audio_hotkey = self.config.get('audio_hotkey', 'ctrl+shift+a')
        self.text_hotkey = self.config.get('text_hotkey', 'ctrl+q')
        
        # Đăng ký các Callback
        self.on_screenshot_captured = self.config.get('on_screenshot_captured', self._default_screenshot_cb)
        self.on_audio_captured = self.config.get('on_audio_captured', self._default_audio_cb)
        self.on_audio_stream_chunk = self.config.get('on_audio_stream_chunk', self._default_audio_stream_cb)
        self.on_audio_stream_end = self.config.get('on_audio_stream_end', self._default_audio_end_cb)
        self.on_text_captured = self.config.get('on_text_captured', self._default_text_cb)
        self.on_audio_transcribe_chunk = self.config.get('on_audio_transcribe_chunk', None)
        self.on_error = self.config.get('on_error', self._default_error_cb)

        # State ghi âm
        self.is_recording = False
        self.should_keep_recording = False
        self.audio_thread = None
        
        # Cấu hình VAD (Smart Auto-Stop)
        self.vad_enabled = self.config.get('vad_enabled', True)
        self.vad_threshold = self.config.get('vad_threshold', 0.2)
        self.vad_silence_duration = self.config.get('vad_silence_duration', 5.0) # 5 giây im lặng
        self.vad_use_gpu = self.config.get('vad_use_gpu', True)
        self.vad_detector = None
        
        # Chống gọi trùng lặp
        self.is_waiting_for_snip = False
        self.last_copied_text = ""

    def _default_screenshot_cb(self, data: bytes):
        print(f"[SystemListener] Screenshot captured. Size: {len(data)} bytes")

    def _default_audio_cb(self, data: bytes):
        print(f"[SystemListener] General audio recording finished. Size: {len(data)} bytes")

    def _default_audio_stream_cb(self, data: bytes):
        pass # Stream data silently by default

    def _default_audio_end_cb(self):
        print(f"[SystemListener] Audio stream ended.")

    def _default_text_cb(self, text: str):
        print(f"[SystemListener] Copied text length: {len(text)} ký tự")
        
    def _default_error_cb(self, error: str):
        print(f"[SystemListener Error] {error}")

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
                    print("[SystemListener] Skipped: Copied text is identical to the previous one.")
        except Exception as e:
            # Lỗi thường xảy ra nếu dữ liệu copy không phải là text (file, hình ảnh nhị phân...)
            pass

    def capture_text(self):
        """Được gọi khi bấm Ctrl+Q"""
        threading.Thread(target=self._wait_for_clipboard_text).start()

    def _wait_for_clipboard_image(self):
        """Luồng chờ đợi người dùng kéo chuột cắt ảnh qua Windows Snipping Tool"""
        try:
            print("\n[SystemListener] Snipping Tool opened. Waiting for selection...")
            
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
                        print("[SystemListener] Successfully captured image from Snipping Tool!")
                        return
                        
            print("[SystemListener] Wait cancelled: No screenshot taken within 30 seconds.")
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

    def _process_completed_audio(self, wav_bytes: bytes):
        """Xử lý bất đồng bộ ở luồng riêng (non-blocking) để không ngắt quãng việc thu âm liên tục"""
        text_result = ""
        MIN_AUDIO_BYTES = 480000  # Đảm bảo tối thiểu ~15.0 giây (480,000 bytes ở 16kHz PCM_16)
        
        if len(wav_bytes) >= MIN_AUDIO_BYTES:
            try:
                print(f"\n[SystemListener] Đang gửi đoạn audio ({len(wav_bytes)} bytes ~ {len(wav_bytes)/32000:.1f}s) lên AI Server để dịch...")
                if self.on_audio_transcribe_chunk:
                    text_result = self.on_audio_transcribe_chunk(wav_bytes)
                if text_result:
                    print(f"[SystemListener] Lấy được text: {text_result}")
            except Exception as e:
                print(f"[SystemListener Error] Lỗi khi lấy text: {e}")
            
            try:
                self.on_audio_captured(wav_bytes, text_result)
            except TypeError:
                self.on_audio_captured(wav_bytes)
        else:
            print(f"[SystemListener] Bỏ qua đoạn audio quá ngắn ({len(wav_bytes)} bytes ~ {len(wav_bytes)/32000:.1f}s < 15.0s). Yêu cầu tối thiểu 15 giây.")

    def _audio_record_task(self):
        try:
            # Khởi tạo Silero VAD nếu bật và chưa khởi tạo
            if self.vad_enabled and self.vad_detector is None:
                try:
                    print(f"[SystemListener] Initializing Silero VAD (GPU CUDA: {self.vad_use_gpu})...")
                    self.vad_detector = SileroVAD(threshold=self.vad_threshold, force_cpu=not self.vad_use_gpu)
                except Exception as e:
                    print(f"[SystemListener Warning] Could not initialize Silero VAD: {e}. Falling back to standard recording.")
                    self.vad_enabled = False

            SAMPLE_RATE = 16000
            CHUNK_SIZE = 512  # 32ms ở 16kHz
            MAX_DURATION = 60

            speaker = sc.default_speaker()
            mic = sc.get_microphone(speaker.id, include_loopback=True)

            while self.should_keep_recording:
                self.is_recording = True
                self.audio_frames = []

                if self.vad_detector:
                    self.vad_detector.reset_states()

                start_time = time.time()
                pre_speech_buffer = deque(maxlen=10)  # Giữ ~320ms âm thanh trước khi nhận diện tiếng nói
                all_recorded_frames = []              # Lưu trữ toàn bộ âm thanh để fallback
                has_speech_started = False
                consecutive_silence_chunks = 0
                max_silence_chunks = int(self.vad_silence_duration / 0.032)
                max_observed_prob = 0.0

                with mic.recorder(samplerate=SAMPLE_RATE) as recorder:
                    while self.is_recording and self.should_keep_recording:
                        if time.time() - start_time >= MAX_DURATION:
                            print("\n[SystemListener] Reached 1-minute recording limit. Auto-segmenting!")
                            break
                            
                        # Thu 32ms chunk
                        data = recorder.record(numframes=CHUNK_SIZE)  # numpy float32
                        all_recorded_frames.append(data)
                        
                        if self.vad_enabled and self.vad_detector:
                            mono_data = np.mean(data, axis=1) if data.ndim > 1 else data
                            
                            # Chuẩn hóa âm lượng mềm (Soft-normalization)
                            max_amp = np.max(np.abs(mono_data))
                            if 0.001 < max_amp < 0.3:
                                vad_input = (mono_data / (max_amp + 1e-7)) * 0.8
                            else:
                                vad_input = mono_data

                            try:
                                prob = self.vad_detector.get_speech_probability(vad_input)
                                if prob > max_observed_prob:
                                    max_observed_prob = prob
                            except Exception as vad_err:
                                print(f"\n[SystemListener VAD Error] {vad_err}. Falling back to standard recording.")
                                self.vad_enabled = False
                                prob = 1.0
                            
                            if prob >= self.vad_threshold:
                                if not has_speech_started:
                                    has_speech_started = True
                                    print(f"\n[SystemListener VAD] Voice detected (prob={prob:.2f})! Speech active...")
                                    self.audio_frames.extend(pre_speech_buffer)
                                    pre_speech_buffer.clear()
                                    
                                self.audio_frames.append(data)
                                consecutive_silence_chunks = 0
                            else:
                                if has_speech_started:
                                    self.audio_frames.append(data)
                                    consecutive_silence_chunks += 1
                                    
                                    if consecutive_silence_chunks >= max_silence_chunks:
                                        # Chỉ ngắt đoạn nếu tổng thời lượng âm thanh thu nhận đã đạt tối thiểu ~15.0 giây (468 chunks x 32ms = 14.976s)
                                        if len(self.audio_frames) >= 468:
                                            print(f"\n[SystemListener VAD] Silence detected for {self.vad_silence_duration}s. Smart Auto-Stop triggered (Segment duration >= 15.0s)!")
                                            break
                                else:
                                    pre_speech_buffer.append(data)
                        else:
                            # Thu âm tiêu chuẩn không dùng VAD
                            self.audio_frames.append(data)
                        
                # Fallback nếu VAD chưa nhận diện được tiếng nói nhưng đã ngắt đoạn
                if not self.audio_frames and all_recorded_frames:
                    print(f"[SystemListener VAD] Threshold ({self.vad_threshold}) not reached (Max prob: {max_observed_prob:.2f}). Preserving recorded audio...")
                    self.audio_frames = all_recorded_frames

                # Xử lý đoạn âm thanh tổng bất đồng bộ (non-blocking)
                if self.audio_frames:
                    audio_data = np.concatenate(self.audio_frames, axis=0)
                    mem_file = io.BytesIO()
                    sf.write(mem_file, audio_data, SAMPLE_RATE, format='WAV', subtype='PCM_16')
                    mem_file.seek(0)
                    wav_bytes = mem_file.read()
                    
                    # Bắn thread nền xử lý API và Webhook bất đồng bộ, không làm nghẽn/lơ đoạn audio tiếp theo!
                    threading.Thread(target=self._process_completed_audio, args=(wav_bytes,), daemon=True).start()
                else:
                    print("[SystemListener VAD] No speech detected during recording session.")

                self.is_recording = False
                
        except Exception as e:
            self.should_keep_recording = False
            self.is_recording = False
            self.on_error(f"Lỗi khi thu âm loa: {e}")

    def toggle_audio(self):
        if not self.should_keep_recording:
            self.should_keep_recording = True
            self.is_recording = True
            self.audio_thread = threading.Thread(target=self._audio_record_task, daemon=True)
            self.audio_thread.start()
            print("\n[SystemListener] Continuous Listening Enabled! (Press hotkey again to stop)")
        else:
            self.should_keep_recording = False
            self.is_recording = False
            print("\n[SystemListener] Stopping Continuous Listening...")

    def start(self, block=True):
        keyboard.add_hotkey(self.screenshot_hotkey, self.take_screenshot)
        keyboard.add_hotkey(self.audio_hotkey, self.toggle_audio)
        keyboard.add_hotkey(self.text_hotkey, self.capture_text)
        
        print(f"=====================================")
        print(f"[SystemListener] Started!")
        print(f" - Screenshot hotkey: {self.screenshot_hotkey}")
        print(f" - Recording hotkey:  {self.audio_hotkey}")
        print(f" - Send text hotkey (from clipboard): {self.text_hotkey}")
        print(f" - Press 'esc' to fully exit.")
        print(f"=====================================")
        
        if block:
            keyboard.wait('esc')
            
    def stop(self):
        keyboard.unhook_all()
        if self.is_recording:
            self.is_recording = False

    def update_config(self, new_config: dict):
        """Cập nhật cấu hình động (hotkeys, VAD) từ Backend/Frontend mà không cần restart"""
        hotkey_changed = False

        if 'screenshot_hotkey' in new_config and new_config['screenshot_hotkey'] != self.screenshot_hotkey:
            self.screenshot_hotkey = new_config['screenshot_hotkey']
            hotkey_changed = True

        if 'audio_hotkey' in new_config and new_config['audio_hotkey'] != self.audio_hotkey:
            self.audio_hotkey = new_config['audio_hotkey']
            hotkey_changed = True

        if 'text_hotkey' in new_config and new_config['text_hotkey'] != self.text_hotkey:
            self.text_hotkey = new_config['text_hotkey']
            hotkey_changed = True

        if hotkey_changed:
            try:
                keyboard.unhook_all()
                keyboard.add_hotkey(self.screenshot_hotkey, self.take_screenshot)
                keyboard.add_hotkey(self.audio_hotkey, self.toggle_audio)
                keyboard.add_hotkey(self.text_hotkey, self.capture_text)
                print(f"[SystemListener] Hotkeys re-registered dynamically!")
                print(f" - Screenshot: {self.screenshot_hotkey} | Audio: {self.audio_hotkey} | Text: {self.text_hotkey}")
            except Exception as e:
                print(f"[SystemListener Error] Failed to re-register hotkeys: {e}")

        # Cập nhật VAD settings
        if 'vad_enabled' in new_config:
            self.vad_enabled = bool(new_config['vad_enabled'])
        if 'vad_threshold' in new_config:
            self.vad_threshold = float(new_config['vad_threshold'])
        if 'vad_silence_duration' in new_config:
            self.vad_silence_duration = float(new_config['vad_silence_duration'])
        if 'vad_use_gpu' in new_config and bool(new_config['vad_use_gpu']) != self.vad_use_gpu:
            self.vad_use_gpu = bool(new_config['vad_use_gpu'])
            self.vad_detector = None # Re-initialize on next recording session

        print("[SystemListener] Settings updated successfully at runtime.")
