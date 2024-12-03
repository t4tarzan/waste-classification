# API Documentation

This document provides detailed information about the machine learning model APIs used in the Waste Classification System.

## Base URL

All API endpoints are prefixed with: `${REACT_APP_ML_API_ENDPOINT}`

## Authentication

API requests require authentication using an API key. Include the key in the request headers:

```
Authorization: Bearer ${API_KEY}
```

## Endpoints

### 1. TrashNet Model API

#### Endpoint: `/api/trashnet`
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Request Body**:
  ```
  {
    "image": File
  }
  ```
- **Response**:
  ```json
  {
    "category": string,
    "confidence": number,
    "metadata": {
      "material": string,
      "recyclable": boolean,
      "subcategories": string[]
    }
  }
  ```
- **Categories**:
  - plastic
  - paper
  - metal
  - glass
  - organic
  - other

### 2. TACO Model API

#### Endpoint: `/api/taco`
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Request Body**:
  ```
  {
    "image": File
  }
  ```
- **Response**:
  ```json
  {
    "objects": [
      {
        "category": string,
        "confidence": number,
        "bbox": [x, y, width, height],
        "metadata": {
          "material": string,
          "recyclable": boolean
        }
      }
    ]
  }
  ```

### 3. WasteNet Model API

#### Endpoint: `/api/wastenet`
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Request Body**:
  ```
  {
    "image": File
  }
  ```
- **Response**:
  ```json
  {
    "material": string,
    "recyclable": boolean,
    "confidence": number,
    "predictions": {
      [category: string]: number
    }
  }
  ```

## Error Handling

The API uses standard HTTP response codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 429: Too Many Requests
- 500: Internal Server Error

Error responses follow this format:
```json
{
  "error": {
    "code": string,
    "message": string
  }
}
```

## Rate Limiting

- Free tier: 100 requests per day
- Authenticated users: 1000 requests per day
- Rate limit headers are included in responses:
  ```
  X-RateLimit-Limit: [requests_per_day]
  X-RateLimit-Remaining: [remaining_requests]
  X-RateLimit-Reset: [reset_timestamp]
  ```

## Examples

### cURL Example
```bash
curl -X POST \
  "${API_BASE_URL}/api/trashnet" \
  -H "Authorization: Bearer ${API_KEY}" \
  -F "image=@/path/to/image.jpg"
```

### JavaScript Example
```javascript
const analyzeImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${API_BASE_URL}/api/trashnet`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Analysis failed');
  }

  return await response.json();
};
```
