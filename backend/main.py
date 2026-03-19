from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from api.router import router

app = FastAPI(title="PDF Autocomplete Backend")

app.include_router(router)

app.mount("/static", StaticFiles(directory="../frontend"), name="static")

@app.get("/")
async def serve_index():
    return FileResponse("../frontend/html/index.html")