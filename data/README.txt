Place your dataset folders here:

data/
├── mammogram_images/
│   ├── benign/         ← mammogram benign images (.jpg, .png, etc.)
│   └── malignant/      ← mammogram malignant images
│
├── ultrasound_images/
│   ├── benign/         ← ultrasound benign images
│   └── malignant/      ← ultrasound malignant images
│
├── testing_image/
│   └── (your test mammogram images)
│
└── test_image/
    └── (your test ultrasound images)

After placing images, run: python training/train.py
