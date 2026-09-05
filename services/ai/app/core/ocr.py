import os
from winsdk.windows.media.ocr import OcrEngine
from winsdk.windows.globalization import Language
from winsdk.windows.graphics.imaging import BitmapDecoder
from winsdk.windows.storage import StorageFile, FileAccessMode

async def run_windows_ocr(image_path: str, lang_code: str = 'en-US') -> str:
    """Executes native Windows OCR engine on an image file."""
    abs_path = os.path.abspath(image_path)
    file = await StorageFile.get_file_from_path_async(abs_path)
    stream = await file.open_async(FileAccessMode.READ)
    decoder = await BitmapDecoder.create_async(stream)
    software_bitmap = await decoder.get_software_bitmap_async()
    
    lang = Language(lang_code)
    if not OcrEngine.is_language_supported(lang):
        raise Exception(f"Language {lang_code} is not supported by Windows OCR. Please install it in Windows Settings.")
        
    engine = OcrEngine.try_create_from_language(lang)
    result = await engine.recognize_async(software_bitmap)
    return result.text
