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
            detail=f"Invalid file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

@router.post("/")
async def predict(
    mammogram: UploadFile = File(..., description="Mammogram image file"),
    ultrasound: UploadFile = File(..., description="Ultrasound image file"),
    patient_id: str = Form(default=""),
):
    validate_image(mammogram)
    validate_image(ultrasound)

    mammo_bytes = await mammogram.read()
    us_bytes = await ultrasound.read()

    if len(mammo_bytes) == 0 or len(us_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded files cannot be empty.")

    try:
        result = run_prediction(mammo_bytes, us_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model inference failed: {str(e)}")

    # Generate patient ID if not provided
    if not patient_id.strip():
        patient_id = f"PAT-{str(uuid.uuid4())[:8].upper()}"

    # Generate AI explanation
    result["explanation"] = generate_explanation(result)

    # Save to history
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
        result["history_id"] = entry["id"]
        result["patient_id"] = patient_id
        result["timestamp"] = entry["timestamp"]
    except Exception as e:
        result["history_id"] = None
        result["patient_id"] = patient_id
        result["timestamp"] = None

    return JSONResponse(content=result)


def generate_explanation(result: dict) -> str:
    pred = result["prediction"]
    conf = result["confidence"]
    m_mal = result["mammogram_malignant"]
    u_mal = result["ultrasound_malignant"]

    if pred == "MALIGNANT":
        level = "high" if conf > 80 else "moderate"
        return (
            f"The multimodal AI system has detected {level}-confidence malignancy indicators "
            f"across both imaging modalities. The mammogram analysis shows {m_mal:.1f}% malignant "
            f"probability, while the ultrasound analysis shows {u_mal:.1f}% malignant probability. "
            f"The late fusion ensemble model combines these signals with an overall confidence of "
            f"{conf:.1f}%. Clinical correlation and biopsy are strongly recommended for definitive diagnosis. "
            f"This result should be reviewed by a qualified radiologist or oncologist."
        )
    else:
        level = "high" if conf > 80 else "moderate"
        return (
            f"The multimodal AI system indicates {level}-confidence benign tissue characteristics "
            f"across both imaging modalities. The mammogram analysis shows {100 - m_mal:.1f}% benign "
            f"probability, while the ultrasound analysis shows {100 - u_mal:.1f}% benign probability. "
            f"The late fusion ensemble model combines these signals with an overall confidence of "
            f"{conf:.1f}%. Routine follow-up screening is advised. While the AI predicts benign "
            f"patterns, regular clinical examination remains essential."
        )
