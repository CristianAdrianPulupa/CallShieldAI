from fastapi import FastAPI, UploadFile, File
import shutil
import os
import uuid

app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload-audio")
async def upload_audio(file: UploadFile = File(...)):
    extension = os.path.splitext(file.filename)[1]

    unique_filename = f"{uuid.uuid4()}{extension}"

    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "message": "Audio recibido correctamente",
        "filename": unique_filename
    }