let FILE_ID = null;

async function uploadPDF() {
    const fileInput = document.getElementById("pdfUpload");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a PDF");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/upload", {
        method: "POST",
        body: formData
    });

    const data = await res.json();
    console.log("Full response:", data);

    FILE_ID = data.stored_as;

    if (!FILE_ID) {
        alert("Upload failed");
        return;
    }

    console.log("Uploaded:", FILE_ID);
    loadPDF(FILE_ID);
}

async function deletePDF() {
    if (!FILE_ID) {
        alert("No file uploaded");
        return;
    }

    const res = await fetch(`/delete?file_id=${FILE_ID}`, {
        method: "DELETE"
    });

    const data = await res.json();
    console.log(data);

    FILE_ID = null;

    // Restore empty state in PDF viewer
    document.getElementById("pdfContainer").innerHTML = `
        <div class="pdf-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p>Upload a PDF to get started</p>
        </div>`;

    // Clear editor text
    document.getElementById("editor").value = "";

    // Clear + hide suggestions bar
    const suggestions = document.getElementById("suggestions");
    suggestions.innerHTML = "";
    suggestions.classList.remove("visible");

    // Clear page count label
    document.getElementById("pageCount").textContent = "";

    // Reset file input and filename label
    document.getElementById("pdfUpload").value = "";
    document.getElementById("fileName").textContent = "No file selected";

    // Reset pdf.js internal doc reference
    pdfDoc = null;
}