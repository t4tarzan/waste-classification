# Waste Classification System

An intelligent waste classification system that leverages multiple machine learning models (TrashNet, TACO, and WasteNet) to analyze and categorize waste materials. This application helps users make informed decisions about waste disposal and promotes environmental sustainability.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- **Multi-Model Analysis**: Utilizes three powerful ML models for accurate waste classification
  - TrashNet: General waste classification
  - TACO: Detailed trash annotations and object detection
  - WasteNet: Specialized waste material identification

- **User Management**:
  - Secure authentication with Firebase
  - Guest access for quick analysis
  - User profiles with analysis history

- **Analytics & Statistics**:
  - Visual representation of waste distribution
  - Analysis history tracking
  - Confidence scores for classifications

- **Smart Features**:
  - Real-time image analysis
  - Material recyclability assessment
  - Disposal recommendations

## Technologies Used

- **Frontend**:
  - React with TypeScript
  - Material-UI (MUI) for UI components
  - React Router for navigation
  - React-Toastify for notifications

- **Backend & Services**:
  - Firebase Authentication
  - Firebase Cloud Storage
  - Firebase Firestore
  - Custom ML model APIs

- **Machine Learning**:
  - TrashNet Model
  - TACO Dataset Model
  - WasteNet Custom Model

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/waste-classification.git
   cd waste-classification
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_ML_API_ENDPOINT=your_ml_api_endpoint
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Usage Guide

1. **Getting Started**:
   - Open the application in your browser
   - Sign up for an account or continue as guest
   - Upload an image of waste material for analysis

2. **Analysis Process**:
   - Select an image to analyze
   - Choose which ML models to use
   - View the classification results
   - Get disposal recommendations

3. **Viewing History**:
   - Access your analysis history (authenticated users)
   - View detailed statistics about your waste patterns
   - Track your environmental impact

## API Documentation

The application interfaces with three ML model endpoints:

1. **TrashNet API**:
   - Endpoint: `/api/trashnet`
   - Method: POST
   - Input: Image file
   - Output: Waste category, confidence score

2. **TACO API**:
   - Endpoint: `/api/taco`
   - Method: POST
   - Input: Image file
   - Output: Detailed object detection results

3. **WasteNet API**:
   - Endpoint: `/api/wastenet`
   - Method: POST
   - Input: Image file
   - Output: Material classification, recyclability

For detailed API documentation, see [API Documentation](docs/api/README.md).

## Version 2.0 Updates

- **Enhanced Type Safety**: Improved TypeScript implementation across all components
- **Optimized API Integration**: Streamlined integration with ML model endpoints
- **Improved Error Handling**: Better error messages and fallback mechanisms
- **Performance Improvements**: Optimized image processing and analysis
- **UI/UX Enhancements**: More responsive and user-friendly interface

## Deployment

The application is deployed on Vercel and can be accessed at:
- Production: [https://www.ecosort.net](https://www.ecosort.net)

### Environment Setup for Deployment

1. **Vercel Configuration**:
   - Set up environment variables in Vercel dashboard
   - Configure build settings to use CRACO
   - Enable automatic deployments from main branch

2. **API Endpoints**:
   - TrashNet API: `https://ecosort.net/api/classify`
   - TACO API: `https://ecosort.net/api/taco/classify`
   - WasteNet API: `https://ecosort.net/api/wastenet/classify`

## Contributing

We welcome contributions to improve the Waste Classification System! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

For detailed contribution guidelines, see [Contributing Guidelines](docs/contributing/README.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- TrashNet dataset contributors
- TACO dataset team
- Material-UI team
- Firebase team
- All contributors and supporters of this project
