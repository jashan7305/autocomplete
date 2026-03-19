from fastapi import UploadFile, File
import pymupdf

import os
import shutil
import uuid
import re
from collections import defaultdict

from logic.store import pdf_store, trie_store
from logic.trie import build_trie

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def clean_word(word):
    return re.sub(r'[^a-zA-Z0-9]', '', word).lower() # lowercase and remove non-alphanumeric chars

def parse_pdf(file_path):
    doc = pymupdf.open(file_path)

    words = []
    word_positions = defaultdict(list)

    for page_num in range(len(doc)):
        page = doc[page_num]
        page_words = page.get_text("words")

        for word in page_words:
            x0, y0, x1, y1, text, *_ = word

            cleaned_word = clean_word(text)
            if not cleaned_word:
                continue

            words.append(cleaned_word)
            word_positions[cleaned_word].append({
                "page": page_num,
                "bbox": [x0, y0, x1, y1]
            })

    doc.close()

    return {
        "words": words,
        "positions": dict(word_positions)
    }

def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        return {"error": "Only PDF files are allowed."}
    
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    data = parse_pdf(file_path)

    trie, freq_map = build_trie(data["words"])

    pdf_store[unique_filename] = data
    trie_store[unique_filename] = trie
    
    return {
        "status": "success",
        "filename": file.filename,
        "stored_as": unique_filename,
        "file_path": file_path,
        "num_words": len(data["words"]),
    }