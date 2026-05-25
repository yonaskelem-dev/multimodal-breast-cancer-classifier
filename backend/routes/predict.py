"""
Prediction Route - Handles multimodal image upload and inference
"""

from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
import uuid
import os

from utils.model_loader import run_prediction
from utils.history_manager import save_prediction

router = APIRouter()

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}


def validate_image(file: UploadFile):
    ext = os.path.splitext(file.filename)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type {ext}. Allowed: {ALLOWED_EXTENSIONS}"
        )


@router.post("/")
async def predict(
    mammogram: UploadFile = File(...),
    ultrasound: UploadFile = File(...),
    patient_id: str = Form(default="")
):

    # Validate files
    validate_image(mammogram)
    validate_image(ultrasound)

    mammo_bytes = await mammogram.read()
    us_bytes = await ultrasound.read()

    if not mammo_bytes or not us_bytes:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    try:
        # Model inference
        result = run_prediction(mammo_bytes, us_bytes)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")

    # Auto-generate patient ID if empty
    if not patient_id.strip():
        patient_id = f"PAT-{str(uuid.uuid4())[:8].upper()}"

    # Add explanation
    result["explanation"] = generate_explanation(result)

    # Save history (safe wrapper)
    try:
        entry = save_prediction(
            patient_id=patient_id,
            prediction=result["prediction"],
            benign_prob=result["benign_prob"],
            malignant_prob=result["malignant_prob"],
            confidence=result["confidence"],
            mammogram_filename=mammogram.filename,
            ultrasound_filename=ultrasound.filename,
            extra={
                "mammogram_benign": result["mammogram_benign"],
                "mammogram_malignant": result["mammogram_malignant"],
                "ultrasound_benign": result["ultrasound_benign"],
                "ultrasound_malignant": result["ultrasound_malignant"],
            }
        )

        result["history_id"] = entry.get("id")
        result["timestamp"] = entry.get("timestamp")
        result["patient_id"] = patient_id

    except Exception:
        result["history_id"] = None
        result["timestamp"] = None
        result["patient_id"] = patient_id

    return JSONResponse(content=result)


def generate_explanation(result: dict) -> str:
    pred = result["prediction"]
    conf = result["confidence"]
    m_mal = result["mammogram_malignant"]
    u_mal = result["ultrasound_malignant"]

    if pred == "MALIGNANT":
        return (
            f"Malignancy detected with {conf:.1f}% confidence. "
            f"Mammogram malignancy: {m_mal:.1f}%, Ultrasound malignancy: {u_mal:.1f}%. "
            f"Clinical confirmation (biopsy) is recommended."
        )
    else:
        return (
            f"Benign result with {conf:.1f}% confidence. "
            f"Mammogram malignancy: {m_mal:.1f}%, Ultrasound malignancy: {u_mal:.1f}%. "
            f"Routine screening recommended."
        )