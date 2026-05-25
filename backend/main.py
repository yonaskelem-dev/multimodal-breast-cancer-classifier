"""
Multimodal Breast Cancer Classification System - FastAPI Backend
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os

from routes.predict import router as predict_router
from routes.history import router as history_router
from routes.report import router as report_router

app = FastAPI(
    title="Multimodal Breast Cancer Classification API",
    description="AI-powered breast cancer classification using mammogram and ultrasound images",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router, prefix="/api/predict", tags=["Prediction"])
app.include_router(history_router, prefix="/api/history", tags=["History"])
app.include_router(report_router, prefix="/api/report", tags=["Report"])

@app.get("/")
def root():
    return {"message": "Breast Cancer Classification API is running", "status": "healthy"}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "API is healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
