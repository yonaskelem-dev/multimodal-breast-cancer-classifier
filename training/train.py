"""
train.py — Training script for the Multimodal Breast Cancer Classifier
Run from the project root: python training/train.py
"""

import os
import sys
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
from sklearn.utils.class_weight import compute_class_weight
from collections import Counter
import numpy as np

PROJECT_ROOT = os.path.join(os.path.dirname(__file__), "..")
MODELS_DIR   = os.path.join(PROJECT_ROOT, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

IMG_SIZE   = 224
BATCH_SIZE = 16
EPOCHS     = 25
LR         = 1e-4
DEVICE     = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print(f"Device: {DEVICE}")

train_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

mammo_dir = os.path.join(PROJECT_ROOT, "mammogram_images")
us_dir    = os.path.join(PROJECT_ROOT, "ultrasound_images")

if not os.path.isdir(mammo_dir):
    print(f"ERROR: Mammogram data not found at {mammo_dir}")
    sys.exit(1)

if not os.path.isdir(us_dir):
    print(f"ERROR: Ultrasound data not found at {us_dir}")
    sys.exit(1)

mammo_dataset = datasets.ImageFolder(mammo_dir, transform=train_transform)
us_dataset    = datasets.ImageFolder(us_dir,    transform=train_transform)

mammo_loader  = DataLoader(mammo_dataset, batch_size=BATCH_SIZE, shuffle=True,  num_workers=2, pin_memory=True)
us_loader     = DataLoader(us_dataset,    batch_size=BATCH_SIZE, shuffle=True,  num_workers=2, pin_memory=True)

print(f"\nMammogram → classes: {mammo_dataset.classes}, dist: {Counter(mammo_dataset.targets)}")
print(f"Ultrasound → classes: {us_dataset.classes},    dist: {Counter(us_dataset.targets)}")

def make_weights(dataset):
    labels = np.array(dataset.targets)
    cw = compute_class_weight(class_weight="balanced", classes=np.unique(labels), y=labels)
    return torch.tensor(cw, dtype=torch.float).to(DEVICE)

mammo_weights = make_weights(mammo_dataset)
us_weights    = make_weights(us_dataset)

def build_resnet18():
    model = models.resnet18(weights="IMAGENET1K_V1")
    model.fc = nn.Linear(model.fc.in_features, 2)
    return model.to(DEVICE)

mammo_model = build_resnet18()
us_model    = build_resnet18()

mammo_criterion = nn.CrossEntropyLoss(weight=mammo_weights)
us_criterion    = nn.CrossEntropyLoss(weight=us_weights)

mammo_optimizer = optim.Adam(mammo_model.parameters(), lr=LR, weight_decay=1e-4)
us_optimizer    = optim.Adam(us_model.parameters(),    lr=LR, weight_decay=1e-4)

mammo_scheduler = optim.lr_scheduler.StepLR(mammo_optimizer, step_size=8, gamma=0.5)
us_scheduler    = optim.lr_scheduler.StepLR(us_optimizer,    step_size=8, gamma=0.5)

def train(model, loader, optimizer, criterion, scheduler, name, epochs):
    print(f"\n{'='*50}")
    print(f"Training: {name}")
    print(f"{'='*50}")
    model.train()
    for epoch in range(epochs):
        total, correct, loss_sum = 0, 0, 0.0
        for x, y in loader:
            x, y = x.to(DEVICE), y.to(DEVICE)
            optimizer.zero_grad()
            out  = model(x)
            loss = criterion(out, y)
            loss.backward()
            optimizer.step()
            loss_sum += loss.item()
            pred     = out.argmax(dim=1)
            total   += y.size(0)
            correct += (pred == y).sum().item()
        scheduler.step()
        acc = 100 * correct / total
        print(f"  Epoch [{epoch+1:>2}/{epochs}]  Loss: {loss_sum:.4f}  Acc: {acc:.2f}%")
    print(f"\n✓ {name} training complete.")

train(mammo_model, mammo_loader, mammo_optimizer, mammo_criterion, mammo_scheduler, "Mammogram ResNet18", EPOCHS)
train(us_model,    us_loader,    us_optimizer,    us_criterion,    us_scheduler,    "Ultrasound ResNet18", EPOCHS)

mammo_path = os.path.join(MODELS_DIR, "mammo_model.pth")
us_path    = os.path.join(MODELS_DIR, "us_model.pth")

torch.save(mammo_model.state_dict(), mammo_path)
torch.save(us_model.state_dict(),    us_path)

print(f"\n✓ Saved: {mammo_path}")
print(f"✓ Saved: {us_path}")
print("\nTraining complete. Run the FastAPI backend to serve predictions.")