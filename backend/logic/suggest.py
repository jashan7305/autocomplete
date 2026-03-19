from logic.store import trie_store


def get_suggestions(file_id, prefix):
    # check if file exists
    if file_id not in trie_store:
        return {"error": "Invalid file_id"}

    trie = trie_store[file_id]

    # normalize prefix
    prefix = prefix.lower()

    node = trie

    for char in prefix:
        if char not in node["children"]:
            return {"suggestions": []}
        node = node["children"][char]

    return {
        "suggestions": node["top"]
    }