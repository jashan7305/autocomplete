import os
from logic.store import pdf_store, trie_store

UPLOAD_DIR = "uploads"


def delete_file(file_id):
    # remove from memory
    pdf_store.pop(file_id, None)
    trie_store.pop(file_id, None)

    # remove file from disk
    file_path = os.path.join(UPLOAD_DIR, file_id)

    if os.path.exists(file_path):
        os.remove(file_path)
        return {"message": "File deleted successfully"}

    return {"error": "File not found"}