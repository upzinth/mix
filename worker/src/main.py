from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from typing import Optional
import os
from .audio_engine import AudioEngine

app = FastAPI(title="MixStudio Audio Worker")
engine = AudioEngine()

class ProcessingRequest(BaseModel):
    file_path: str
    task_type: str  # 'trim' or 'separate'
    params: Optional[dict] = None

@app.get("/health")
def health():
    return {"status": "online", "worker": "Python AI Engine"}

@app.post("/process")
async def process_audio(request: ProcessingRequest):
    if not os.path.exists(request.file_path):
        raise HTTPException(status_code=404, detail="Source file not found")

    try:
        if request.task_type == "trim":
            start = request.params.get("start", 0)
            end = request.params.get("end", 10)
            result_path = engine.trim(request.file_path, start, end)
            return {"status": "completed", "result_path": result_path}
            
        elif request.task_type == "separate":
            stems = engine.separate_stems(request.file_path)
            return {"status": "completed", "stems": stems}
            
        else:
            raise HTTPException(status_code=400, detail="Unknown task type")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
