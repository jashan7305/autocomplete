from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse

import os

from logic.pdf import upload_pdf
from logic.suggest import get_suggestions
from logic.highlight import get_word_positions

router = APIRouter()

@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    file.file.seek(0)
    result = upload_pdf(file)
    return result

@router.get("/suggest")
async def suggest(file_id: str, prefix: str):
    result = get_suggestions(file_id, prefix)
    return result

@router.get("/highlight")
async def highlight(file_id: str, word: str):
    return get_word_positions(file_id, word)

@router.get("/pdf/{file_id}")
async def get_pdf(file_id: str):
    file_path = os.path.join("uploads", file_id)

    if not os.path.exists(file_path):
        return {"error": "File not found"}

    return FileResponse(file_path, media_type="application/pdf")
