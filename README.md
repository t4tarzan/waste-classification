# Waste Classification System

A machine learning-powered web application for real-time waste classification and segregation.

## Features

- Real-time waste classification using ML
- Support for image uploads and camera feed
- Automatic segregation into categories:
  - Dry waste
  - Wet waste
  - Plastic
  - Hazardous waste
- Manual classification interface for uncertain cases
- Reporting and analytics dashboard

## Project Structure

```
waste-classification/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # Firebase and ML services
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
├── backend/                 # Firebase Cloud Functions
│   ├── functions/          # Backend logic
│   └── ml/                 # ML model integration
```

## Setup Instructions

(Setup instructions will be added as the project develops)

## Development Status

Currently in prototype phase, supporting:
- Single company usage
- 10-15 devices
- Processing ~1000 images per day
- 2-hour daily operation window
