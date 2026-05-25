"""
Model Loader - Loads pre-trained ResNet18 models for mammogram and ultrasound
"""

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
import os
import numpy as np

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_resnet18(weights_path: str = None):
    """Load a ResNet18 model with 2-class output."""
    model = models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, 2)
    
    if weights_path and os.path.exists(weights_path):
        try:
            state = torch.load(weights_path, map_location=device)
            model.load_state_dict(state)
            print(f"Loaded weights from {weights_path}")
        except Exception as e:
            print(f"Warning: Could not load weights from {weights_path}: {e}")
            print("Using untrained model for demo purposes.")
    else:
        print(f"No weights file at {weights_path}. Using untrained model for demo.")
    
    model = model.to(device)
    model.eval()
    return model

# Lazy-load models so the app starts even without .pth files
_mammo_model = None
_us_model = None

def get_mammo_model():
    global _mammo_model
    if _mammo_model is None:
        path = os.path.join(MODELS_DIR, "mammo_model.pth")
        _mammo_model = load_resnet18(path)
    return _mammo_model

def get_us_model():
    global _us_model
    if _us_model is None:
        path = os.path.join(MODELS_DIR, "us_model.pth")
        _us_model = load_resnet18(path)
    return _us_model

def preprocess_image(image_bytes: bytes) -> torch.Tensor:
    """Preprocess image bytes into a model-ready tensor."""
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = transform(image).unsqueeze(0).to(device)
    return tensor

def run_prediction(mammo_bytes: bytes, us_bytes: bytes) -> dict:
    """
    Run multimodal prediction using late fusion (average of softmax scores).
    
    Returns:
        dict with benign_prob, malignant_prob, prediction, confidence
    """
    softmax = nn.Softmax(dim=1)
    
    mammo_tensor = preprocess_image(mammo_bytes)
    us_tensor = preprocess_image(us_bytes)
    
    mammo_model = get_mammo_model()
    us_model = get_us_model()
    
    with torch.no_grad():
        m_out = mammo_model(mammo_tensor)
        u_out = us_model(us_tensor)
        
        m_prob = softmax(m_out)
        u_prob = softmax(u_out)
        
        # Late fusion: average probabilities
        fused = (m_prob + u_prob) / 2
    
    probs = fused.cpu().numpy()[0]
    benign_prob = float(probs[0]) * 100
    malignant_prob = float(probs[1]) * 100
    
    # Individual modality results (for detailed report)
    m_probs = m_prob.cpu().numpy()[0]
    u_probs = u_prob.cpu().numpy()[0]
    
    prediction = "MALIGNANT" if malignant_prob > benign_prob else "BENIGN"
    confidence = max(benign_prob, malignant_prob)
    
    return {
        "benign_prob": round(benign_prob, 2),
        "malignant_prob": round(malignant_prob, 2),
        "prediction": prediction,
        "confidence": round(confidence, 2),
        "mammogram_benign": round(float(m_probs[0]) * 100, 2),
        "mammogram_malignant": round(float(m_probs[1]) * 100, 2),
        "ultrasound_benign": round(float(u_probs[0]) * 100, 2),
        "ultrasound_malignant": round(float(u_probs[1]) * 100, 2),
    }
