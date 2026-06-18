document.addEventListener("DOMContentLoaded", () => {
    const editor = document.getElementById("editor");
    const suggestionsDiv = document.getElementById("suggestions");

    /**
     * Calculates the pixel coordinates of the caret in a textarea.
     * @param {HTMLTextAreaElement} textarea - The textarea element.
     * @returns {{x: number, y: number}} The x and y coordinates relative to the textarea.
     */
    function getCaretCoords(textarea) {
        const mirror = document.createElement("div");
        const style = window.getComputedStyle(textarea);

        mirror.style.cssText = `
            position: absolute;
            visibility: hidden;
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow-wrap: break-word;
            font: ${style.font};
            font-size: ${style.fontSize};
            font-family: ${style.fontFamily};
            font-weight: ${style.fontWeight};
            line-height: ${style.lineHeight};
            letter-spacing: ${style.letterSpacing};
            padding: ${style.padding};
            border: ${style.border};
            width: ${textarea.offsetWidth}px;
            box-sizing: border-box;
        `;

        document.body.appendChild(mirror);

        const text = textarea.value.substring(0, textarea.selectionStart);
        mirror.textContent = text;

        const span = document.createElement("span");
        span.textContent = "|";
        mirror.appendChild(span);

        const spanRect = span.getBoundingClientRect();
        const textareaRect = textarea.getBoundingClientRect();

        document.body.removeChild(mirror);

        return {
            x: spanRect.left - textareaRect.left + textarea.scrollLeft,
            y: spanRect.top  - textareaRect.top  + textarea.scrollTop
        };
    }

    /**
     * Positions the suggestions popup near the caret.
     */
    function positionSuggestions() {
        const editorWrap = editor.parentElement;
        const wrapRect   = editorWrap.getBoundingClientRect();
        const coords     = getCaretCoords(editor);

        const LINE_HEIGHT = parseInt(window.getComputedStyle(editor).lineHeight) || 22;
        const PADDING     = 6;

        let top  = coords.y + LINE_HEIGHT + PADDING;
        let left = coords.x;

        suggestionsDiv.style.top  = top  + "px";
        suggestionsDiv.style.left = left + "px";

        // After render, nudge left if it overflows the panel
        requestAnimationFrame(() => {
            const popupW = suggestionsDiv.offsetWidth;
            const wrapW  = editorWrap.offsetWidth;
            if (left + popupW > wrapW - 12) {
                suggestionsDiv.style.left = Math.max(0, wrapW - popupW - 12) + "px";
            }
        });
    }

    /**
     * Gets the word fragment currently being typed.
     * @param {HTMLTextAreaElement} textarea - The textarea element.
     * @returns {string} The word being typed.
     */
    function getCurrentWord(textarea) {
        const pos  = textarea.selectionStart;
        const text = textarea.value;

        // Walk left from cursor to find word start
        let start = pos;
        while (start > 0 && !/\s/.test(text[start - 1])) start--;

        // The fragment from word-start to cursor
        return text.slice(start, pos);
    }

    // ── Main input handler ───────────────────────────────────────────────
    editor.addEventListener("input", async () => {
        if (!FILE_ID) return;

        const prefix = getCurrentWord(editor);

        // Hide if no prefix or prefix is just whitespace
        if (!prefix || prefix.trim() === "") {
            hideSuggestions();
            return;
        }

        try {
            const res  = await fetch(`/suggest?file_id=${FILE_ID}&prefix=${encodeURIComponent(prefix)}`);
            const data = await res.json();
            const list = data.suggestions || [];

            if (list.length === 0) {
                hideSuggestions();
            } else {
                showSuggestions(list);
            }
        } catch (err) {
            console.error("Suggest error:", err);
            hideSuggestions();
        }
    });

    let selectedIndex = -1;

    /**
     * Updates the UI selection state.
     */
    function updateSelection() {
        const items = suggestionsDiv.querySelectorAll(".suggestion-item");
        items.forEach((el, i) => {
            el.classList.toggle("selected", i === selectedIndex);
        });
    }

    // Arrow keys + Tab navigation
    editor.addEventListener("keydown", (e) => {
        const items = suggestionsDiv.querySelectorAll(".suggestion-item");
        const visible = suggestionsDiv.classList.contains("visible") && items.length > 0;

        if (!visible) return;

        if (e.key === "ArrowRight") {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % items.length;
            updateSelection();
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            updateSelection();
        } else if (e.key === "Tab") {
            e.preventDefault();
            // If nothing selected, default to first
            const idx = selectedIndex >= 0 ? selectedIndex : 0;
            const word = items[idx]?.querySelector(".suggestion-label")?.textContent;
            if (word) insertSuggestion(word);
            selectedIndex = -1;
        } else if (e.key === "Escape") {
            hideSuggestions();
            selectedIndex = -1;
        }
    });

    // Hide on outside click
    document.addEventListener("click", (e) => {
        if (!suggestionsDiv.contains(e.target) && e.target !== editor) {
            hideSuggestions();
        }
    });

    /**
     * Displays the suggestion list in the UI.
     * @param {string[]} list - The list of suggestions.
     */
    function showSuggestions(list) {
        suggestionsDiv.innerHTML = "";

        const currentPrefix = getCurrentWord(editor);

        list.forEach(word => {
            const div = document.createElement("div");
            div.className = "suggestion-item";

            const dot = document.createElement("span");
            dot.className = "suggestion-dot";
            div.appendChild(dot);

            const label = document.createElement("span");
            label.className = "suggestion-label";

            if (currentPrefix.length > 0 && word.toLowerCase().startsWith(currentPrefix.toLowerCase())) {
                const matchSpan = document.createElement("span");
                matchSpan.className = "match";
                matchSpan.textContent = word.slice(0, currentPrefix.length);
                label.appendChild(matchSpan);
                label.appendChild(document.createTextNode(word.slice(currentPrefix.length)));
            } else {
                label.textContent = word;
            }

            div.appendChild(label);

            div.addEventListener("mousedown", (e) => {
                e.preventDefault();
                insertSuggestion(word);
            });

            suggestionsDiv.appendChild(div);
        });

        suggestionsDiv.classList.add("visible");
        selectedIndex = -1;
    }

    /**
     * Hides the suggestion popup.
     */
    function hideSuggestions() {
        suggestionsDiv.innerHTML = "";
        suggestionsDiv.classList.remove("visible");
    }

    /**
     * Escapes HTML characters.
     * @param {string} str - The string to escape.
     * @returns {string} The escaped string.
     */
    function escapeHtml(str) {
        return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    }

    /**
     * Inserts the chosen suggestion into the editor.
     * @param {string} word - The suggestion to insert.
     */
    function insertSuggestion(word) {
        const pos    = editor.selectionStart;
        const text   = editor.value;

        // Find start of the current word
        let wordStart = pos;
        while (wordStart > 0 && !/\s/.test(text[wordStart - 1])) wordStart--;

        // Replace the current word fragment with the full suggestion + space
        const before = text.slice(0, wordStart);
        const after  = text.slice(pos);
        editor.value = before + word + " " + after;

        // Move cursor to after inserted word
        const newPos = wordStart + word.length + 1;
        editor.selectionStart = editor.selectionEnd = newPos;

        hideSuggestions();
        editor.focus();

        if (window.highlightWord) {
            window.highlightWord(word);
        }
    }
});
