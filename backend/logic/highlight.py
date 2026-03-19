from logic.store import pdf_store


def get_word_positions(file_id, word):
    # check if file exists
    if file_id not in pdf_store:
        return {"error": "Invalid file_id"}

    data = pdf_store[file_id]

    # normalize word
    word = word.lower()

    if word not in data["positions"]:
        return {"positions": []}

    return {
        "positions": data["positions"][word]
    }