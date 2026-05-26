"""
History Route - CRUD for prediction history
"""

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from utils.history_manager import get_all_history, get_by_patient_id, delete_entry, clear_history

router = APIRouter()

@router.get("/")
def list_history(patient_id: str = Query(default=None)):
    if patient_id:
        return JSONResponse(content=get_by_patient_id(patient_id))
    return JSONResponse(content=get_all_history())

@router.delete("/{entry_id}")
def remove_entry(entry_id: int):
    success = delete_entry(entry_id)
    if not success:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"message": "Deleted successfully"}

@router.delete("/clear")
def wipe_history():
    clear_history()
    return {"message": "History cleared"}