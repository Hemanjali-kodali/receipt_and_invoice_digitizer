<<<<<<< HEAD
# receipt_and_invoice_digitizer
||||||| (empty tree)
=======
# Receipt & Invoice Digitizer Dashboard

A full-stack application for digitizing receipts and invoices with drag-and-drop upload, OCR data extraction, and a RESTful backend API.

## 🌟 Features

### Frontend
- 📄 **Beautiful Landing Page** - Professional showcase with features and benefits
- 📤 **Drag & Drop Upload** - Intuitive file upload interface
- 🎨 **Modern UI** - Clean design with gradient effects and animations
- 📱 **Mobile Friendly** - Fully responsive on all devices
- ⚡ **Fast Processing** - Quick file handling with real-time updates
- 🤖 **OCR Data Extraction** - Extract vendor info, totals, dates, invoice numbers
- 📊 **Statistics Dashboard** - Real-time file counts and analytics
- 🔍 **Search & Filter** - Find files by name or type
- 👁️ **File Preview** - View images and PDFs in modal
- 💾 **Export** - Download data as CSV or JSON

### Backend API
- 🖥️ **REST API** - Node.js/Express server
- 📁 **File Management** - Upload, retrieve, delete operations
- 🔒 **Validation** - File type and size checking
- 📊 **Analytics** - Real-time statistics endpoint
- 🤖 **OCR Simulation** - Mock data extraction (integration-ready)

## 🚀 Quick Start

### Installation
```bash
# Frontend
npm install

# Backend
cd backend && npm install
```

### Running

**Option 1: Quick Start (Windows)**
```bash
start-dev.bat
```

**Option 2: Manual Start**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```
→ Backend: http://localhost:5000

Terminal 2 (Frontend):
```bash
npm run dev
```
→ Frontend: http://localhost:3000

## 💻 Tech Stack

**Frontend:** React 18, React Router, Vite, CSS3  
**Backend:** Node.js, Express, Multer, CORS, UUID

## 📁 Project Structure

```
Dashboard/
├── src/                  # Frontend
│   ├── pages/           # Page components
│   ├── services/        # API layer
│   └── ...
├── backend/             # Backend API
│   ├── server.js       # Express server
│   ├── uploads/        # File storage
│   └── README.md       # API docs
└── start-dev.bat       # Quick start script
```

## 🔌 API Endpoints

- `POST /api/upload` - Upload files
- `GET /api/files` - List all files
- `GET /api/files/:id` - Get file
- `DELETE /api/files/:id` - Delete file
- `POST /api/extract/:id` - Extract data
- `GET /api/stats` - Get statistics
- `GET /api/export/json` - Export JSON
- `GET /api/export/csv` - Export CSV

See [backend/README.md](backend/README.md) for detailed API documentation.

## 📖 Usage

1. **Upload** - Drag & drop or browse for JPG, PNG, PDF files
2. **Extract** - Click "Extract Data" to get vendor, total, date, invoice #
3. **Search** - Find files by name or filter by type
4. **Preview** - Click preview to view in modal with extracted data
5. **Export** - Download all data as CSV or JSON
6. **Manage** - Delete files you no longer need

## 🎯 Key Features

- Real-time file statistics
- OCR simulation with vendor, totals, dates, line items
- Search and filter capabilities
- File preview modal for images and PDFs
- Server-side export to CSV/JSON
- Delete confirmation dialogs
- 10MB file size limit, 10 files per upload

## 🔮 Future Enhancements

- Real OCR (Tesseract.js, Google Vision, AWS Textract)
- Database integration (MongoDB/PostgreSQL)
- User authentication (JWT)
- Cloud storage (S3, Azure Blob)
- Advanced analytics and charts
- Batch processing
- Email notifications
- Multi-language support

## 🐛 Troubleshooting

**Connection errors:** Ensure backend runs on port 5000  
**Upload fails:** Check file size (<10MB) and type (JPG/PNG/PDF)  
**Preview issues:** Browser must support iframe for PDFs

---

Built with ❤️ using React & Node.js
>>>>>>> 6fa6b47 (commit on 20260223 - dashboard 1)
