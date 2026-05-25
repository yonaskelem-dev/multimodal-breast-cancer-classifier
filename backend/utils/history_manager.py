"""
History Manager - Stores and retrieves prediction history using a JSON file.
In production this would be replaced with a proper database (PostgreSQL, MongoDB).
"""

import json
import os
from datetime import datetime
from typing import List, Optional

HISTORY_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "history.json")

def _ensure_file():
    os.makedirs(os.path.dirname(HISTORY_FILE), exist_ok=True)
    if not os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "w") as f:
            json.dump([], f)

def save_prediction(
    patient_id: str,
    prediction: str,
    benign_prob: float,
    malignant_prob: float,
    confidence: float,
    mammogram_filename: str,
    ultrasound_filename: str,
    extra: dict = None
) -> dict:
    _ensure_file()
    with open(HISTORY_FILE, "r") as f:
        history = json.load(f)
    
    entry = {
        "id": len(history) + 1,
        "patient_id": patient_id,
        "prediction": prediction,
        "benign_prob": benign_prob,
        "malignant_prob": malignant_prob,
        "confidence": confidence,
        "mammogram_filename": mammogram_filename,
        "ultrasound_filename": ultrasound_filename,
        "timestamp": datetime.now().isoformat(),
        "date": datetime.now().strftime("%Y-%m-%d"),
        "time": datetime.now().strftime("%H:%M:%S"),
    }
    if extra:
        entry.update(extra)
    
    history.append(entry)
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)
    
    return entry

def get_all_history() -> List[dict]:
    _ensure_file()
    with open(HISTORY_FILE, "r") as f:
        return json.load(f)

def get_by_patient_id(patient_id: str) -> List[dict]:
    return [e for e in get_all_history() if e["patient_id"] == patient_id]

def delete_entry(entry_id: int) -> bool:
    _ensure_file()
    with open(HISTORY_FILE, "r") as f:
        history = json.load(f)
    
    new_history = [e for e in history if e["id"] != entry_id]
    if len(new_history) == len(history):
        return False
    
    with open(HISTORY_FILE, "w") as f:
        json.dump(new_history, f, indent=2)
    return True

def clear_history() -> bool:
    _ensure_file()
    with open(HISTORY_FILE, "w") as f:
        json.dump([], f)
    return True
