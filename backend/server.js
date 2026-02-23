const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { spawn, spawnSync } = require('child_process');

const OCR_SCRIPT = path.join(__dirname, 'ocr.py');

// Run pytesseract OCR on a file and update its record asynchronously
function runOCR(fileRecord) {
  fileRecord.status = 'Processing';

  const py = spawn('python', [OCR_SCRIPT, fileRecord.path]);
  let output = '';
  let errOutput = '';

  py.stdout.on('data', (data) => { output += data.toString(); });
  py.stderr.on('data', (data) => { errOutput += data.toString(); });

  py.on('close', (code) => {
    try {
      const result = JSON.parse(output);
      if (result.success) {
        fileRecord.extractedData = result.data;
        fileRecord.status = 'Processed';
        console.log(`[OCR] Done: ${fileRecord.name}`);
      } else {
        fileRecord.status = 'Error';
        fileRecord.ocrError = result.error;
        console.error(`[OCR] Error for ${fileRecord.name}: ${result.error}`);
      }
    } catch (e) {
      fileRecord.status = 'Error';
      fileRecord.ocrError = errOutput || e.message;
      console.error(`[OCR] Parse error for ${fileRecord.name}: ${e.message}`);
    }
  });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Define uploads directory path (inside backend folder)
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (JPG, PNG) and PDF files are allowed!'));
    }
  }
});

// In-memory database (replace with actual database in production)
let filesDatabase = [];

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Get all files
app.get('/api/files', (req, res) => {
  res.json({
    success: true,
    count: filesDatabase.length,
    files: filesDatabase
  });
});

// Get single file
app.get('/api/files/:id', (req, res) => {
  const file = filesDatabase.find(f => f.id === req.params.id);
  
  if (!file) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }
  
  res.json({
    success: true,
    file: file
  });
});

// Upload files
app.post('/api/upload', upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => {
      const fileData = {
        id: uuidv4(),
        name: file.originalname,
        filename: file.filename,
        size: (file.size / 1024).toFixed(2) + ' KB',
        type: file.mimetype.includes('image') ? 'Image' : file.mimetype.includes('pdf') ? 'PDF' : 'Document',
        mimetype: file.mimetype,
        path: file.path,
        url: `http://localhost:${PORT}/uploads/${file.filename}`,
        status: 'Uploaded',
        uploadedAt: new Date().toISOString(),
        extractedData: null
      };
      
      filesDatabase.push(fileData);
      // Auto-trigger OCR immediately after upload
      runOCR(fileData);
      return fileData;
    });

    res.json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      files: uploadedFiles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message
    });
  }
});

// Run OCR extraction on demand (synchronous — returns data immediately)
app.post('/api/extract/:id', (req, res) => {
  const file = filesDatabase.find(f => f.id === req.params.id);

  if (!file) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }

  if (file.status === 'Processing') {
    return res.status(409).json({
      success: false,
      message: 'OCR is already running for this file.'
    });
  }

  file.status = 'Processing';

  try {
    const result = spawnSync('python', [OCR_SCRIPT, file.path], { encoding: 'utf8', timeout: 60000 });

    if (result.error) {
      throw result.error;
    }

    const parsed = JSON.parse(result.stdout);

    if (parsed.success) {
      file.extractedData = parsed.data;
      file.status = 'Processed';
      console.log(`[OCR] Done: ${file.name}`);
      return res.json({
        success: true,
        message: 'Data extracted successfully',
        data: parsed.data
      });
    } else {
      file.status = 'Error';
      file.ocrError = parsed.error;
      return res.status(500).json({
        success: false,
        message: 'OCR failed: ' + parsed.error
      });
    }
  } catch (e) {
    file.status = 'Error';
    file.ocrError = e.message;
    console.error(`[OCR] Error for ${file.name}:`, e.message);
    return res.status(500).json({
      success: false,
      message: 'OCR error: ' + e.message
    });
  }
});

// Delete file
app.delete('/api/files/:id', (req, res) => {
  const fileIndex = filesDatabase.findIndex(f => f.id === req.params.id);
  
  if (fileIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }

  const file = filesDatabase[fileIndex];
  
  // Delete physical file
  if (fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }

  // Remove from database
  filesDatabase.splice(fileIndex, 1);

  res.json({
    success: true,
    message: 'File deleted successfully'
  });
});

// Get statistics
app.get('/api/stats', (req, res) => {
  const stats = {
    total: filesDatabase.length,
    images: filesDatabase.filter(f => f.type === 'Image').length,
    pdfs: filesDatabase.filter(f => f.type === 'PDF').length,
    documents: filesDatabase.filter(f => f.type === 'Document').length,
    processed: filesDatabase.filter(f => f.status === 'Processed').length,
    totalSize: filesDatabase.reduce((acc, file) => {
      const sizeNum = parseFloat(file.size);
      return acc + sizeNum;
    }, 0).toFixed(2) + ' KB'
  };

  res.json({
    success: true,
    stats: stats
  });
});

// Export data
app.get('/api/export/:format', (req, res) => {
  const format = req.params.format;

  if (format === 'json') {
    res.json({
      success: true,
      exportDate: new Date().toISOString(),
      totalFiles: filesDatabase.length,
      files: filesDatabase
    });
  } else if (format === 'csv') {
    const headers = ['ID', 'Name', 'Size', 'Type', 'Status', 'Uploaded At', 'Vendor', 'Total', 'Invoice Number'];
    const rows = filesDatabase.map(file => [
      file.id,
      file.name,
      file.size,
      file.type,
      file.status,
      new Date(file.uploadedAt).toLocaleString(),
      file.extractedData?.vendor || 'N/A',
      file.extractedData?.total || 'N/A',
      file.extractedData?.invoiceNumber || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=export-${Date.now()}.csv`);
    res.send(csvContent);
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid format. Use json or csv'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Upload directory: ${UPLOADS_DIR}`);
});
