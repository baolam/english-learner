import os
from huggingface_hub import hf_hub_download
from llama_cpp import Llama

class LlamaService:
    def __init__(self):
        self.repo_id = "lmstudio-community/Llama-3.2-1B-Instruct-GGUF"
        self.filename = "Llama-3.2-1B-Instruct-Q4_K_M.gguf"
        
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.model_dir = os.path.join(base_dir, "models")
        self.model_path = os.path.join(self.model_dir, self.filename)
        
        self._ensure_model_downloaded()
        
        print("Loading Llama model with llama-cpp-python...")
        self.llm = Llama(
            model_path=self.model_path,
            n_ctx=1024,
            n_batch=256,
            n_gpu_layers=0, # Use CPU only
            verbose=True
        )
        print("Llama 3.2 1B Service initialized (GPU Mode).")

    def _ensure_model_downloaded(self):
        os.makedirs(self.model_dir, exist_ok=True)
        if not os.path.exists(self.model_path):
            print(f"Downloading model {self.filename} to {self.model_dir} (Approx 800MB)...")
            hf_hub_download(
                repo_id=self.repo_id,
                filename=self.filename,
                local_dir=self.model_dir
            )
            print("Download complete!")

    def generate_response(self, user_prompt: str) -> str:
        prompt = f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\nYou are a helpful, smart, and concise AI assistant. You only answer in English.<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{user_prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"
        
        try:
            output = self.llm(
                prompt,
                max_tokens=512,
                temperature=0.7,
                stop=["<|eot_id|>"],
                echo=False
            )
            answer = output["choices"][0]["text"].strip()
            return answer
        except Exception as e:
            return f"[Lỗi Llama-cpp] Không thể chạy AI: {e}"

if __name__ == "__main__":
    ai_service = LlamaService()
    prompt = "Give me a 3-sentence summary of how to learn a new language effectively."
    print(f"\nUser: {prompt}")
    answer = ai_service.generate_response(prompt)
    print(f"\nAI: {answer}")
