# DEBT REPORT

## backend/logic/trie.py
- **Complexity/Debt:** Moderate (30/100). Lacked type hints and documentation.
- **Actions:** Added type hints and Google-style docstrings. Refactored logic to be more explicit.
- **Verification:** Verified with tests in `backend/tests/test_trie.py`.

## backend/logic/pdf.py
- **Complexity/Debt:** High (80/100).
- **Observations:** Depends on `pymupdf` (not pre-installed), uses global state (`pdf_store`, `trie_store`), tightly coupled to FastAPI `UploadFile` and filesystem operations.
- **Actions:** Documentation-only (Track B). Added docstrings for `clean_word`.
- **Note:** Could not be verified because `pymupdf` is not available in the environment.

## Frontend
- **Language:** JavaScript.
- **Observations:** Contains frontend logic, UI, and CSS.
- **Actions:** Documentation-only (Track B).
