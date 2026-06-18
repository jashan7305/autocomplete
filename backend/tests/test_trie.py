import pytest
from backend.logic.trie import build_trie, insert_word, create_node

def test_build_trie():
    words = ["apple", "app", "application"]
    trie, freq = build_trie(words)
    assert "apple" in freq
    assert freq["apple"] == 1
    assert "app" in freq
    assert "application" in freq
    assert trie["children"]["a"]["children"]["p"]["children"]["p"]["is_end"] == True

def test_insert_word():
    freq = {"apple": 2}
    node = create_node()
    insert_word(node, "apple", freq)
    assert node["children"]["a"]["children"]["p"]["children"]["p"]["children"]["l"]["children"]["e"]["is_end"] == True
