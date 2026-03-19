let pdfDoc = null;
let scale = 1.5;

async function loadPDF(fileId) {
    const url = `/pdf/${fileId}`;

    const loadingTask = pdfjsLib.getDocument(url);
    pdfDoc = await loadingTask.promise;

    const container = document.getElementById("pdfContainer");
    container.innerHTML = "";

    for (let i = 1; i <= pdfDoc.numPages; i++) {
        await renderPage(i, container);
    }

    const pageCount = document.getElementById("pageCount");
    if (pageCount) {
        pageCount.textContent = `${pdfDoc.numPages} page${pdfDoc.numPages !== 1 ? 's' : ''}`;
    }
}

async function renderPage(num, container) {
    const page = await pdfDoc.getPage(num);

    const panelWidth = document.querySelector(".pdf-scroll").clientWidth - 40;
    const unscaledViewport = page.getViewport({ scale: 1 });
    scale = Math.min(1.5, panelWidth / unscaledViewport.width);

    const viewport = page.getViewport({ scale });

    const wrapper = document.createElement("div");
    wrapper.className = "page-wrapper";
    wrapper.style.position = "relative";
    wrapper.style.width = viewport.width + "px";

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.height = viewport.height;
    canvas.width = viewport.width;
    canvas.id = `page-${num}`;

    wrapper.appendChild(canvas);
    container.appendChild(wrapper);

    await page.render({
        canvasContext: context,
        viewport: viewport
    }).promise;
}

window.highlightWord = async function(word) {
    if (!FILE_ID) return;

    const res = await fetch(`/highlight?file_id=${FILE_ID}&word=${word}`);
    const data = await res.json();

    drawHighlights(data.positions || []);
};

function drawHighlights(positions) {
    document.querySelectorAll(".highlight-box").forEach(el => el.remove());

    positions.forEach(pos => {
        const { page, bbox } = pos;

        const canvas = document.getElementById(`page-${page + 1}`);
        if (!canvas) return;

        const wrapper = canvas.parentElement;

        let [x0, y0, x1, y1] = bbox;

        x0 *= scale;
        y0 *= scale;
        x1 *= scale;
        y1 *= scale;

        const div = document.createElement("div");
        div.className = "highlight-box";
        div.style.position = "absolute";
        div.style.left   = x0 + "px";
        div.style.top    = y0 + "px";
        div.style.width  = (x1 - x0) + "px";
        div.style.height = (y1 - y0) + "px";

        wrapper.appendChild(div);

        canvas.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
}