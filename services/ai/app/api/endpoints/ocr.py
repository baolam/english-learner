import os
import shutil
import tempfile
from fastapi import APIRouter, File, UploadFile, HTTPException
from app.core.ocr import run_windows_ocr

router = APIRouter(tags=["OCR"])

@router.post("/api/ocr")
async def process_ocr(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")
    
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
            
        text = await run_windows_ocr(tmp_path, lang_code='en-US')
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
