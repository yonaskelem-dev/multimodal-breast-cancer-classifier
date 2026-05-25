Multimodal Breast Cancer Classification System

This is an AI-powered web application for breast cancer classification using mammogram and ultrasound images with a deep learning model (ResNet18 + late fusion).

Project Overview

The system predicts whether a case is benign or malignant by combining results from two imaging modalities: mammography and ultrasound. It provides real-time predictions, patient history tracking, and downloadable reports.

Backend

Built with FastAPI, the backend handles image upload, model inference, history storage, and PDF report generation. It exposes REST APIs used by the frontend for communication.

Frontend

Built with React and Tailwind CSS, the frontend provides a clean medical dashboard where users can upload images, view predictions, and check past results.

AI Model

The system uses ResNet18 models for both mammogram and ultrasound images. A late fusion strategy combines both outputs to produce the final prediction.

Features

Users can upload medical images, get prediction results instantly, view prediction history, and export PDF reports for records.

Purpose

This project is developed for educational and research purposes and is not intended for real medical diagnosis.
