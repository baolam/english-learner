import os
import json
import base64
import tempfile
import asyncio
from app.config import redis_client
from app.core.ocr import run_windows_ocr

async def redis_ocr_worker():
    print("[Redis Worker] Started listening to 'ocr_tasks'...")
    while True:
        try:
            result = await redis_client.blpop("ocr_tasks", timeout=0)
            if result:
                queue_name, message = result
                data = json.loads(message)
                
                task_id = data.get("task_id")
                image_base64 = data.get("image_base64")
                
                if image_base64:
                    image_bytes = base64.b64decode(image_base64)
                    
                    tmp_path = None
                    try:
                        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
                            tmp.write(image_bytes)
                            tmp_path = tmp.name
                            
                        text = await run_windows_ocr(tmp_path, lang_code='en-US')
                        
                        result_payload = {
                            "task_id": task_id,
                            "type": "screen",
                            "result_text": text,
                            "status": "success"
                        }
                        await redis_client.publish("ai_results", json.dumps(result_payload))
                        
                    except Exception as e:
                        error_payload = {
                            "task_id": task_id,
                            "type": "screen",
                            "error": str(e),
                            "status": "error"
                        }
                        await redis_client.publish("ai_results", json.dumps(error_payload))
                    finally:
                        if tmp_path and os.path.exists(tmp_path):
                            os.remove(tmp_path)
                            
        except Exception as e:
            print(f"[Redis Worker] Error in worker loop: {e}")
            await asyncio.sleep(1)
