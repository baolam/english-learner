import os
import urllib.request
import numpy as np
import onnxruntime as ort

MODEL_URL = "https://github.com/snakers4/silero-vad/raw/master/src/silero_vad/data/silero_vad.onnx"
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, "silero_vad.onnx")

class SileroVAD:
    """
    Silero VAD Detector hỗ trợ GPU (NVIDIA CUDA) thông qua ONNX Runtime CUDAExecutionProvider.
    Tự động fallback sang CPU nếu CUDA không có sẵn.
    """
    def __init__(self, model_path=MODEL_PATH, threshold=0.5, sample_rate=16000, force_cpu=False):
        self.model_path = model_path
        self.threshold = threshold
        self.sample_rate = sample_rate
        self.force_cpu = force_cpu
        
        self._ensure_model_exists()
        self._init_session()
        self.reset_states()

    def _ensure_model_exists(self):
        """Tự động tải model silero_vad.onnx từ GitHub nếu chưa có sẵn ở địa phương."""
        if not os.path.exists(self.model_path):
            print(f"[VAD] Model file not found. Downloading from {MODEL_URL}...")
            try:
                urllib.request.urlretrieve(MODEL_URL, self.model_path)
                print(f"[VAD] Model downloaded successfully: {self.model_path}")
            except Exception as e:
                print(f"[VAD Error] Failed to download silero_vad.onnx: {e}")
                raise e

    def _init_session(self):
        """Khởi tạo ONNX Runtime session ưu tiên CUDA Execution Provider (GPU)."""
        available_providers = ort.get_available_providers()
        print(f"[VAD] Available ONNX Providers: {available_providers}")
        
        providers = []
        if not self.force_cpu and 'CUDAExecutionProvider' in available_providers:
            # Cấu hình GPU CUDA Execution Provider (MX130)
            cuda_options = {
                'device_id': 0,
                'arena_extend_strategy': 'kNextPowerOfTwo',
                'cudnn_conv_algo_search': 'EXHAUSTIVE',
                'do_copy_in_default_stream': True,
            }
            providers.append(('CUDAExecutionProvider', cuda_options))
            print("[VAD] Configured ONNX Session with CUDA Execution Provider (GPU).")
        
        providers.append('CPUExecutionProvider')
        
        session_options = ort.SessionOptions()
        session_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        
        self.session = ort.InferenceSession(self.model_path, session_options, providers=providers)
        self.active_provider = self.session.get_providers()[0]
        print(f"[VAD] Active Inference Provider: {self.active_provider}")
        
        # Nhận diện phiên bản Schema Silero VAD (v4 vs v5)
        self.input_names = [i.name for i in self.session.get_inputs()]
        self.is_v5 = 'state' in self.input_names
        print(f"[VAD] Model Schema: {'v5 (state)' if self.is_v5 else 'v4 (h, c)'}")

    def reset_states(self):
        """Reset hidden state cho Silero VAD trước mỗi đợt thu âm mới."""
        if getattr(self, 'is_v5', False):
            self._state = np.zeros((2, 1, 128), dtype=np.float32)
        else:
            self._h = np.zeros((2, 1, 64), dtype=np.float32)
            self._c = np.zeros((2, 1, 64), dtype=np.float32)

    def get_speech_probability(self, chunk: np.ndarray) -> float:
        """
        Đánh giá chunk âm thanh (phải là 1D numpy float32, độ dài 512 samples ở 16kHz).
        Trả về: Xác suất có giọng nói (0.0 -> 1.0).
        """
        if chunk.ndim == 1:
            chunk = np.expand_dims(chunk, axis=0)
            
        if getattr(self, 'is_v5', False):
            ort_inputs = {
                'input': chunk.astype(np.float32),
                'state': self._state,
                'sr': np.array(self.sample_rate, dtype=np.int64)
            }
            out, self._state = self.session.run(None, ort_inputs)
        else:
            ort_inputs = {
                'input': chunk.astype(np.float32),
                'h': self._h,
                'c': self._c,
                'sr': np.array(self.sample_rate, dtype=np.int64)
            }
            out, self._h, self._c = self.session.run(None, ort_inputs)
            
        prob = float(out[0][0])
        return prob
