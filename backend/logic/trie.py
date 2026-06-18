from collections import defaultdict
from typing import Dict, List, Tuple, Any

# Trie structure:
# {
#   'children': Dict[str, Any],
#   'is_end': bool,
#   'freq': int,
#   'top': List[str]   # top suggestions at this prefix
# }

def create_node() -> Dict[str, Any]:
    """Creates a new empty trie node."""
    return {
        "children": {},
        "is_end": False,
        "freq": 0,
        "top": []
    }


def create_trie() -> Dict[str, Any]:
    """Creates a new empty trie."""
    return create_node()


def insert_word(trie: Dict[str, Any], word: str, frequency_map: Dict[str, int], top_k: int = 5) -> None:
    """
    Inserts a word into the trie.

    Args:
        trie: The root node of the trie.
        word: The word to insert.
        frequency_map: Mapping of words to their frequencies.
        top_k: Number of top suggestions to maintain.
    """
    node = trie

    for char in word:
        if char not in node["children"]:
            node["children"][char] = create_node()

        node = node["children"][char]

        # update top suggestions at this node
        update_top(node, word, frequency_map, top_k)

    node["is_end"] = True
    node["freq"] = frequency_map[word]


def update_top(node: Dict[str, Any], word: str, frequency_map: Dict[str, int], top_k: int) -> None:
    """
    Updates the top suggestions list for a node.

    Args:
        node: The trie node to update.
        word: The word to add to the suggestions.
        frequency_map: Mapping of words to their frequencies.
        top_k: Number of top suggestions to maintain.
    """
    # add word if not present
    if word not in node["top"]:
        node["top"].append(word)

    # sort by frequency (descending)
    node["top"].sort(key=lambda w: frequency_map[w], reverse=True)

    # keep only top_k
    if len(node["top"]) > top_k:
        node["top"] = node["top"][:top_k]


def build_trie(words: List[str], top_k: int = 5) -> Tuple[Dict[str, Any], Dict[str, int]]:
    """
    Builds a trie from a list of words.

    Args:
        words: List of words to index.
        top_k: Number of top suggestions to maintain.

    Returns:
        A tuple of (root_node, frequency_map).
    """
    trie = create_trie()

    # build frequency map
    frequency_map = defaultdict(int)
    for word in words:
        frequency_map[word] += 1

    # insert words into trie
    for word in frequency_map:
        insert_word(trie, word, frequency_map, top_k)

    return trie, dict(frequency_map)
