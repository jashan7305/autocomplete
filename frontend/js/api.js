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

    // 🔥 Load PDF after upload
    loadPDF(FILE_ID);
}