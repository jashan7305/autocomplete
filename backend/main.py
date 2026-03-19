from fastapi import FastAPI

from api.router import router

app = FastAPI(title="PDF Autocomplete Backend")

app.include_router(router)