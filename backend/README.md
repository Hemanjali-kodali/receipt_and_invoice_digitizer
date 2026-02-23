# Receipt & Invoice Backend API

Backend server for the Receipt and Invoice Digitizer Dashboard.

## Features

- 📤 File upload with validation (images and PDFs)
- 🗄️ File storage and management
- 🤖 OCR/Data extraction simulation
- 📊 Statistics and analytics
- 💾 Export data (JSON/CSV)
- 🔐 CORS enabled for frontend communication

## API Endpoints

### Health Check
- **GET** `/api/health` - Check server status

### Files Management
- **GET** `/api/files` - Get all uploaded files
- **GET** `/api/files/:id` - Get single file by ID
- **POST** `/api/upload` - Upload files (multipart/form-data)
- **DELETE** `/api/files/:id` - Delete file

### Data Extraction
- **POST** `/api/extract/:id` - Extract data from file (OCR simulation)

### Statistics & Export
- **GET** `/api/stats` - Get statistics
- **GET** `/api/export/json` - Export all data as JSON
- **GET** `/api/export/csv` - Export all data as CSV

## Installation

```bash
cd backend
npm install
```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on **http://localhost:5000**

## File Upload

Send POST request to `/api/upload` with form-data:
- Field name: `files`
- Allowed types: JPG, PNG, PDF
- Max size: 10MB per file
- Max files: 10 per request

## Response Format

All responses follow this structure:

```json
{
  "success": true/false,
  "message": "Description",
  "data": {...}
}
```

## Environment Variables

Create a `.env` file (optional):
```
PORT=5000
```

## Tech Stack

- Node.js
- Express.js
- Multer (file uploads)
- CORS
- UUID

## Future Enhancements

- Real OCR integration (Tesseract.js, Google Vision API)
- Database integration (MongoDB, PostgreSQL)
- User authentication & authorization
- Cloud storage (AWS S3, Azure Blob)
- Rate limiting
- API documentation (Swagger)
