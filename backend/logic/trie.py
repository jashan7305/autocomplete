from collections import defaultdict

# Trie structure:
# {
#   'children': {},
#   'is_end': False,
#   'freq': 0,
#   'top': []   # top suggestions at this prefix
# }

def create_node():
    return {
        "children": {},
        "is_end": False,
        "freq": 0,
        "top": []
    }


def create_trie():
    return create_node()


def insert_word(trie, word, frequency_map, top_k=5):
    node = trie

    for char in word:
        if char not in node["children"]:
            node["children"][char] = create_node()

        node = node["children"][char]

        # update top suggestions at this node
        update_top(node, word, frequency_map, top_k)

    node["is_end"] = True
    node["freq"] = frequency_map[word]


def update_top(node, word, frequency_map, top_k):
    # add word if not present
    if word not in node["top"]:
        node["top"].append(word)

    # sort by frequency (descending)
    node["top"].sort(key=lambda w: frequency_map[w], reverse=True)

    # keep only top_k
    if len(node["top"]) > top_k:
        node["top"] = node["top"][:top_k]


def build_trie(words, top_k=5):
    trie = create_trie()

    # build frequency map
    frequency_map = defaultdict(int)
    for word in words:
        frequency_map[word] += 1

    # insert words into trie
    for word in frequency_map:
        insert_word(trie, word, frequency_map, top_k)

    return trie, dict(frequency_map)