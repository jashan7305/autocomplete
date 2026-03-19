from fastapi import APIRouter, UploadFile, File

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
