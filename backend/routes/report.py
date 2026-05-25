"""
Report Route - Generate PDF reports from prediction results
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import io
from datetime import datetime

router = APIRouter()

class ReportRequest(BaseModel):
    patient_id: str
    prediction: str
    benign_prob: float
    malignant_prob: float
    confidence: float
    mammogram_benign: Optional[float] = None
    mammogram_malignant: Optional[float] = None
    ultrasound_benign: Optional[float] = None
    ultrasound_malignant: Optional[float] = None
    explanation: str
    timestamp: Optional[str] = None

@router.post("/generate")
def generate_pdf(data: ReportRequest):
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="reportlab not installed. Run: pip install reportlab"
        )

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )

    # Colors
    PURPLE = colors.HexColor("#7C3AED")
    DARK_PURPLE = colors.HexColor("#4C1D95")
    YELLOW = colors.HexColor("#F59E0B")
    LIGHT_GRAY = colors.HexColor("#F3F4F6")
    DARK_GRAY = colors.HexColor("#1F2937")
    RED_COLOR = colors.HexColor("#DC2626")
    GREEN_COLOR = colors.HexColor("#059669")

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("title", parent=styles["Title"],
        fontSize=20, textColor=DARK_PURPLE, spaceAfter=6, alignment=TA_CENTER)
    subtitle_style = ParagraphStyle("subtitle", parent=styles["Normal"],
        fontSize=11, textColor=PURPLE, spaceAfter=4, alignment=TA_CENTER)
    heading_style = ParagraphStyle("heading", parent=styles["Heading2"],
        fontSize=13, textColor=DARK_PURPLE, spaceBefore=12, spaceAfter=6)
    body_style = ParagraphStyle("body", parent=styles["Normal"],
        fontSize=10, textColor=DARK_GRAY, spaceAfter=4, leading=16, alignment=TA_JUSTIFY)
    label_style = ParagraphStyle("label", parent=styles["Normal"],
        fontSize=9, textColor=colors.HexColor("#6B7280"), spaceAfter=2)

    story = []

    # Header
    story.append(Paragraph("Multimodal Breast Cancer", title_style))
    story.append(Paragraph("Classification System — AI Diagnostic Report", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=PURPLE, spaceAfter=12))

    # Report meta
    ts = data.timestamp or datetime.now().isoformat()
    try:
        dt = datetime.fromisoformat(ts)
        date_str = dt.strftime("%B %d, %Y")
        time_str = dt.strftime("%H:%M:%S")
    except Exception:
        date_str = ts[:10]
        time_str = ts[11:19] if len(ts) > 18 else ""

    meta_data = [
        ["Patient ID", data.patient_id, "Report Date", date_str],
        ["Report Time", time_str, "AI Model", "ResNet18 Multimodal Fusion"],
        ["Modalities", "Mammogram + Ultrasound", "Version", "v1.0.0"],
    ]
    meta_table = Table(meta_data, colWidths=[4*cm, 6*cm, 4*cm, 6*cm])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_GRAY),
        ("TEXTCOLOR", (0, 0), (0, -1), PURPLE),
        ("TEXTCOLOR", (2, 0), (2, -1), PURPLE),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [LIGHT_GRAY, colors.white]),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 16))

    # Final result box
    story.append(Paragraph("Final Prediction Result", heading_style))
    result_color = RED_COLOR if data.prediction == "MALIGNANT" else GREEN_COLOR
    result_data = [
        [Paragraph(f'<b><font size="16" color="{result_color.hexval()}">{data.prediction}</font></b>',
                   ParagraphStyle("r", alignment=TA_CENTER)),
         Paragraph(f'<b>Confidence: {data.confidence:.1f}%</b>',
                   ParagraphStyle("c", alignment=TA_CENTER, fontSize=12))]
    ]
    result_table = Table(result_data, colWidths=[9*cm, 9*cm])
    result_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_GRAY),
        ("BOX", (0, 0), (-1, -1), 2, PURPLE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("PADDING", (0, 0), (-1, -1), 14),
    ]))
    story.append(result_table)
    story.append(Spacer(1, 16))

    # Probability table
    story.append(Paragraph("Probability Breakdown", heading_style))
    prob_data = [
        ["Modality", "Benign %", "Malignant %"],
        ["Mammogram", f"{data.mammogram_benign or 0:.2f}%", f"{data.mammogram_malignant or 0:.2f}%"],
        ["Ultrasound", f"{data.ultrasound_benign or 0:.2f}%", f"{data.ultrasound_malignant or 0:.2f}%"],
        ["Fused (Final)", f"{data.benign_prob:.2f}%", f"{data.malignant_prob:.2f}%"],
    ]
    prob_table = Table(prob_data, colWidths=[6*cm, 6*cm, 6*cm])
    prob_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PURPLE),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_GRAY]),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("PADDING", (0, 0), (-1, -1), 8),
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#EDE9FE")),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
    ]))
    story.append(prob_table)
    story.append(Spacer(1, 16))

    # Explanation
    story.append(Paragraph("AI Analysis Explanation", heading_style))
    story.append(Paragraph(data.explanation, body_style))
    story.append(Spacer(1, 16))

    # Disclaimer
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#D1D5DB"), spaceAfter=8))
    disclaimer = (
        "<b>⚠ Medical Disclaimer:</b> This report is generated by an artificial intelligence system "
        "for research and educational purposes only. It is not intended to replace professional medical "
        "diagnosis, treatment, or advice. Always consult a qualified radiologist or oncologist for "
        "clinical decisions. The AI model's predictions carry inherent uncertainty and should be "
        "interpreted alongside clinical history, physical examination, and other diagnostic tests."
    )
    story.append(Paragraph(disclaimer, ParagraphStyle("disc", parent=styles["Normal"],
        fontSize=8, textColor=colors.HexColor("#6B7280"), leading=12, alignment=TA_JUSTIFY)))

    doc.build(story)
    buffer.seek(0)

    filename = f"BreastCancer_Report_{data.patient_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
