# 📚 Complete Technical Documentation
## Receipt & Invoice Digitizer Dashboard

---

## 🏗️ Overall Architecture

### **Full-Stack MERN-like Architecture**
```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   React Frontend│ ←HTTP→  │  Express Backend│ ←FS→    │  File System    │
│   (Port 3000)   │         │   (Port 5000)   │         │  (uploads/)     │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

---

## 🎯 Technology Stack by Layer

### **Frontend Technologies**
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI Library - Component-based architecture |
| **React DOM** | 18.2.0 | DOM rendering for React |
| **React Router DOM** | 6.21.0 | Client-side routing between pages |
| **Vite** | 5.0.8 | Build tool, dev server, HMR (Hot Module Replacement) |
| **@vitejs/plugin-react** | 4.2.1 | React Fast Refresh support in Vite |
| **CSS3** | - | Styling with gradients, animations, flexbox, grid |
| **JavaScript ES6+** | - | Modern JavaScript features |

### **Backend Technologies**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | - | JavaScript runtime environment |
| **Express.js** | 4.18.2 | Web framework for REST API |
| **Multer** | 1.4.5-lts.1 | Middleware for file upload handling |
| **CORS** | 2.8.5 | Enable Cross-Origin Resource Sharing |
| **UUID** | 9.0.1 | Generate unique file IDs |
| **fs (File System)** | Built-in | Read/write files to disk |
| **path** | Built-in | Handle file paths across OS |

---

## 🔄 Complete Data Flow

### **1. File Upload Flow**

```
USER ACTION → FRONTEND → BACKEND → FILE SYSTEM → DATABASE → RESPONSE
```

**Step-by-Step with Technologies:**

#### Step 1: User Drags File
**Technology:** HTML5 Drag & Drop API
```javascript
// Features.jsx - React Component
onDragEnter, onDragLeave, onDragOver, onDrop
```

#### Step 2: Frontend Processes File
**Technology:** React State Management (useState Hook)
```javascript
const [uploadedFiles, setUploadedFiles] = useState([])
```

#### Step 3: Send to Backend
**Technology:** Fetch API + FormData
```javascript
// api.js
const formData = new FormData();
formData.append('files', file);
await fetch('http://localhost:5000/api/upload', {
  method: 'POST',
  body: formData
});
```

#### Step 4: Backend Receives Request
**Technology:** Express.js + Multer
```javascript
// server.js
app.post('/api/upload', upload.array('files', 10), (req, res) => {
  // Multer processes multipart/form-data
  // Files available in req.files
});
```

#### Step 5: File Storage
**Technology:** Multer DiskStorage + Node.js fs module
```javascript
const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: `${uuidv4()}-${originalname}`
});
```

#### Step 6: Generate Metadata
**Technology:** UUID + JavaScript
```javascript
const fileData = {
  id: uuidv4(),
  name: file.originalname,
  size: (file.size / 1024).toFixed(2) + ' KB',
  url: `http://localhost:${PORT}/uploads/${file.filename}`
};
```

#### Step 7: Store in Memory Database
**Technology:** JavaScript Array (In-memory)
```javascript
let filesDatabase = [];
filesDatabase.push(fileData);
```

#### Step 8: Return Response
**Technology:** Express JSON Response
```javascript
res.json({
  success: true,
  files: uploadedFiles
});
```

#### Step 9: Frontend Updates UI
**Technology:** React State Update
```javascript
setUploadedFiles(prev => [...prev, ...response.files]);
```

---

## 🎨 Feature-by-Feature Technology Breakdown

### **Feature 1: Landing Page (Home)**

**Component:** `Home.jsx`

**Technologies Used:**
- **React Functional Component** - Component structure
- **React Router Link** - Navigation between pages
- **CSS3 Gradients** - Visual design
  ```css
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  ```
- **CSS Grid** - Feature cards layout
  ```css
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  ```
- **CSS Flexbox** - Navigation bar alignment
- **CSS Animations** - Hover effects and transitions
  ```css
  transition: transform 0.3s, box-shadow 0.3s;
  ```

**Visual Features:**
- Gradient backgrounds using CSS linear-gradient
- Card hover animations using CSS transforms
- Responsive grid using CSS Grid
- Typography with web-safe fonts

---

### **Feature 2: Drag & Drop File Upload**

**Component:** `Features.jsx`

**Technologies Used:**

#### HTML5 Drag & Drop API
```javascript
onDragEnter={(e) => {
  e.preventDefault();
  setDragActive(true);
}}
onDrop={(e) => {
  e.preventDefault();
  handleFiles(e.dataTransfer.files); // DataTransfer API
}}
```

#### HTML5 File Input API
```javascript
<input
  type="file"
  multiple
  accept="image/*,.pdf"
  onChange={(e) => handleFiles(e.target.files)}
/>
```

#### React useState Hook
```javascript
const [dragActive, setDragActive] = useState(false);
const [processing, setProcessing] = useState(false);
```

#### JavaScript FileList & Array.from()
```javascript
const files = Array.from(filesList);
```

**Flow:**
1. User drags file → HTML5 Drag API captures event
2. File dropped → DataTransfer.files contains file objects
3. React updates state → UI shows processing indicator
4. FormData created → Fetch API sends to backend
5. Backend saves → Multer DiskStorage writes to disk

---

### **Feature 3: File Processing & Storage**

**Backend Technologies:**

#### Multer Middleware
```javascript
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`)
});
```

#### File Validation
```javascript
fileFilter: (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname));
  const mimetype = allowedTypes.test(file.mimetype);
}
```

#### Node.js Path Module
```javascript
const path = require('path');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
```

#### Node.js fs Module
```javascript
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}
```

---

### **Feature 4: OCR Data Extraction (Simulation)**

**Technologies Used:**

#### Frontend: Fetch API + Async/Await
```javascript
const extractData = async (fileData) => {
  const response = await api.extractData(fileData.id);
  if (response.success) {
    setExtractedData(prev => ({ ...prev, [fileData.id]: response.data }));
  }
};
```

#### Backend: Express POST Route
```javascript
app.post('/api/extract/:id', (req, res) => {
  const file = filesDatabase.find(f => f.id === req.params.id);
  
  // Simulate OCR with mock data
  const extractedData = {
    vendor: randomVendor(),
    total: randomAmount(),
    date: randomDate(),
    items: generateLineItems()
  };
  
  file.extractedData = extractedData;
  res.json({ success: true, data: extractedData });
});
```

#### JavaScript Math.random()
```javascript
total: '$' + (Math.random() * 1000 + 50).toFixed(2)
```

#### JavaScript Array Methods
```javascript
items: [1, 2, 3].map(() => ({
  name: `Product ${i}`,
  price: '$' + (Math.random() * 100).toFixed(2)
}))
```

**Real OCR Integration (Future):**
- Tesseract.js (JavaScript OCR library)
- Google Vision API (Cloud OCR)
- AWS Textract (Document analysis)

---

### **Feature 5: Real-time Statistics**

**Technologies Used:**

#### React useEffect Hook
```javascript
useEffect(() => {
  loadFiles(); // Fetch on component mount
}, []);
```

#### JavaScript Array Filter & Reduce
```javascript
const stats = {
  total: uploadedFiles.length,
  images: uploadedFiles.filter(f => f.type === 'Image').length,
  pdfs: uploadedFiles.filter(f => f.type === 'PDF').length,
  totalSize: uploadedFiles.reduce((acc, file) => 
    acc + parseFloat(file.size), 0
  ).toFixed(2)
};
```

#### Backend Aggregation
```javascript
app.get('/api/stats', (req, res) => {
  const stats = {
    total: filesDatabase.length,
    processed: filesDatabase.filter(f => f.status === 'Processed').length
  };
  res.json({ success: true, stats });
});
```

#### CSS Grid for Layout
```css
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}
```

---

### **Feature 6: Search & Filter**

**Technologies Used:**

#### React Controlled Components
```javascript
const [searchQuery, setSearchQuery] = useState('');
const [filterType, setFilterType] = useState('All');

<input
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

#### JavaScript String Methods
```javascript
const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
```

#### JavaScript Array Filter
```javascript
const filteredFiles = uploadedFiles.filter(file => {
  const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesType = filterType === 'All' || file.type === filterType;
  return matchesSearch && matchesType;
});
```

#### Real-time UI Update
- React re-renders automatically when state changes
- No database queries needed (client-side filtering)

---

### **Feature 7: Export to CSV/JSON**

**Technologies Used:**

#### Frontend: Blob API
```javascript
const exportToJSON = async () => {
  const data = await api.exportJSON();
  const blob = new Blob([JSON.stringify(data, null, 2)], 
    { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `export-${Date.now()}.json`;
  link.click();
};
```

#### Backend: CSV Generation
```javascript
const headers = ['ID', 'Name', 'Size', 'Type'];
const rows = filesDatabase.map(file => [
  file.id, file.name, file.size, file.type
]);
const csvContent = [
  headers.join(','),
  ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
].join('\n');
```

#### Express Response Headers
```javascript
res.setHeader('Content-Type', 'text/csv');
res.setHeader('Content-Disposition', 'attachment; filename=export.csv');
res.send(csvContent);
```

#### JavaScript Array Methods
- `map()` - Transform data
- `join()` - Create CSV string
- `JSON.stringify()` - Format JSON

---

### **Feature 8: File Preview Modal**

**Technologies Used:**

#### React Conditional Rendering
```javascript
{previewFile && (
  <div className="modal-overlay">
    <div className="modal-content">
      {/* Preview content */}
    </div>
  </div>
)}
```

#### HTML5 Image Element
```javascript
<img src={previewFile.url} alt={previewFile.name} />
```

#### HTML5 iframe for PDFs
```javascript
<iframe src={previewFile.url} title={previewFile.name}></iframe>
```

#### CSS Fixed Positioning
```css
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 1000;
}
```

#### Event Bubbling Control
```javascript
onClick={(e) => e.stopPropagation()} // Prevent modal close on content click
```

#### Express Static File Serving
```javascript
app.use('/uploads', express.static(UPLOADS_DIR));
// Serves files at http://localhost:5000/uploads/filename
```

---

### **Feature 9: File Deletion**

**Technologies Used:**

#### Window.confirm() API
```javascript
if (!confirm('Are you sure?')) return;
```

#### Fetch DELETE Request
```javascript
await fetch(`${API_URL}/files/${id}`, { method: 'DELETE' });
```

#### Express DELETE Route
```javascript
app.delete('/api/files/:id', (req, res) => {
  const fileIndex = filesDatabase.findIndex(f => f.id === req.params.id);
  const file = filesDatabase[fileIndex];
  
  // Delete physical file
  fs.unlinkSync(file.path);
  
  // Remove from database
  filesDatabase.splice(fileIndex, 1);
});
```

#### Node.js fs.unlinkSync()
```javascript
const fs = require('fs');
fs.unlinkSync(file.path); // Synchronously delete file
```

#### JavaScript Array splice()
```javascript
filesDatabase.splice(fileIndex, 1); // Remove from array
```

#### React State Update
```javascript
setUploadedFiles(prev => prev.filter(file => file.id !== id));
```

---

### **Feature 10: Responsive Design**

**Technologies Used:**

#### CSS Media Queries
```css
@media (max-width: 768px) {
  .files-grid { grid-template-columns: 1fr; }
  .hero-title { font-size: 2rem; }
}
```

#### CSS Flexbox
```css
.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

#### CSS Grid with Auto-fit
```css
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
```

#### Viewport Meta Tag
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

---

## 🔐 Security Features & Technologies

### **1. CORS (Cross-Origin Resource Sharing)**
```javascript
const cors = require('cors');
app.use(cors()); // Allows frontend (port 3000) to access backend (port 5000)
```

### **2. File Type Validation**
```javascript
fileFilter: (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  if (!allowedTypes.test(file.mimetype)) {
    cb(new Error('Invalid file type'));
  }
}
```

### **3. File Size Limits**
```javascript
limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
```

### **4. Unique Filenames (Prevent Overwrites)**
```javascript
filename: `${uuidv4()}-${file.originalname}`
```

### **5. Path Traversal Prevention**
```javascript
const path = require('path');
const safePath = path.join(__dirname, 'uploads', sanitizedFilename);
```

---

## 🗂️ State Management Technologies

### **React Hooks Used:**

#### useState - Component State
```javascript
const [uploadedFiles, setUploadedFiles] = useState([]);
const [dragActive, setDragActive] = useState(false);
const [processing, setProcessing] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [filterType, setFilterType] = useState('All');
const [previewFile, setPreviewFile] = useState(null);
const [extractedData, setExtractedData] = useState({});
```

#### useEffect - Side Effects
```javascript
useEffect(() => {
  loadFiles(); // Fetch data on mount
  
  return () => {
    // Cleanup object URLs
    uploadedFiles.forEach(file => {
      if (file.url) URL.revokeObjectURL(file.url);
    });
  };
}, []);
```

---

## 🌐 API Communication Technologies

### **Frontend API Service Layer**
```javascript
// src/services/api.js
export const api = {
  uploadFiles: async (files) => {
    const formData = new FormData();
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  }
};
```

### **Fetch API Features Used:**
- GET requests - Retrieve data
- POST requests - Upload files, extract data
- DELETE requests - Remove files
- Headers - Content-Type, Content-Disposition
- Blob handling - For file downloads
- JSON parsing - response.json()

---

## 📦 Build & Development Tools

### **Vite** (Frontend Build Tool)
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()], // React Fast Refresh
  server: { port: 3000 }
});
```

**Features:**
- Hot Module Replacement (HMR)
- Fast builds with esbuild
- ES modules in development
- Optimized production bundles

### **Nodemon** (Backend Development)
```json
"scripts": {
  "dev": "nodemon server.js"
}
```

**Features:**
- Auto-restart on file changes
- Watch specific file types
- Ignore node_modules

---

## 🎨 Styling Technologies

### **CSS3 Features Used:**

#### Gradients
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

#### Transforms & Transitions
```css
transition: transform 0.3s, box-shadow 0.3s;
transform: translateY(-5px);
```

#### Flexbox
```css
display: flex;
justify-content: space-between;
align-items: center;
gap: 2rem;
```

#### CSS Grid
```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
gap: 2rem;
```

#### Box Shadow
```css
box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
```

#### Border Radius
```css
border-radius: 15px;
```

#### Animations
```css
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

---

## 🔄 Complete Request-Response Cycle

### **Example: File Upload**

```
1. USER BROWSER
   └─ User drops file on upload zone
   └─ HTML5 Drag & Drop API captures file

2. REACT COMPONENT (Features.jsx)
   └─ handleDrop() → handleFiles(files)
   └─ setProcessing(true) - Update UI state
   └─ Call api.uploadFiles(files)

3. API SERVICE LAYER (api.js)
   └─ Create FormData object
   └─ Append files to FormData
   └─ Fetch POST to http://localhost:5000/api/upload
   └─ Return JSON response

4. NETWORK LAYER
   └─ HTTP POST request with multipart/form-data
   └─ CORS allows cross-origin request

5. EXPRESS SERVER (server.js)
   └─ CORS middleware allows request
   └─ Multer middleware processes multipart data
   └─ Files available in req.files array

6. MULTER MIDDLEWARE
   └─ DiskStorage saves files to backend/uploads/
   └─ UUID generates unique filename
   └─ File metadata extracted (size, type, etc.)

7. FILE SYSTEM
   └─ Node.js fs module writes file to disk
   └─ File stored at: backend/uploads/uuid-filename.ext

8. SERVER LOGIC
   └─ Create file metadata object
   └─ Generate URL: http://localhost:5000/uploads/filename
   └─ Push to filesDatabase array
   └─ Send JSON response

9. NETWORK RESPONSE
   └─ HTTP 200 OK
   └─ JSON body with uploaded file data

10. FRONTEND RECEIVES RESPONSE
    └─ api.js returns parsed JSON
    └─ Features.jsx updates state
    └─ setUploadedFiles([...prev, ...newFiles])
    └─ setProcessing(false)

11. REACT RE-RENDERS
    └─ Virtual DOM diffing
    └─ UI updates to show new files
    └─ File cards appear in grid
```

---

## 📊 Data Structures Used

### **File Object Structure**
```javascript
{
  id: "uuid-v4",                    // UUID
  name: "receipt.jpg",              // String
  filename: "uuid-receipt.jpg",     // String
  size: "245.67 KB",                // String
  type: "Image",                    // String (Image|PDF|Document)
  mimetype: "image/jpeg",           // String
  path: "backend/uploads/...",      // String
  url: "http://localhost:5000/...", // String
  status: "Processed",              // String
  uploadedAt: "2026-02-12T...",     // ISO String
  extractedData: {                  // Object or null
    vendor: "ABC Corp",
    date: "2/12/2026",
    total: "$234.56",
    items: [...]
  }
}
```

### **Backend Database**
```javascript
let filesDatabase = []; // Array of file objects (In-memory)
```

### **Frontend State Objects**
```javascript
uploadedFiles: Array<FileObject>
extractedData: { [fileId: string]: ExtractedData }
```

---

## 🚀 Performance Optimizations

### **1. Code Splitting**
- React Router lazy loading (can be added)
- Vite automatic code splitting

### **2. Image Optimization**
- Browser-native lazy loading
- Object URL creation for preview

### **3. State Management**
- React's automatic batching
- Efficient re-renders with Virtual DOM

### **4. File Handling**
- Stream processing for large files
- Chunked uploads (can be added)

---

## 🔧 Development Technologies

### **Package Managers**
- npm (Node Package Manager)

### **Version Control**
- Git (implied by .gitignore)

### **Code Editors**
- VS Code (recommended)

### **Browser DevTools**
- React DevTools
- Network tab for API debugging
- Console for errors

---

## 📈 Scalability Considerations

### **Current Architecture:**
- In-memory database (not persistent)
- Local file storage
- Single server instance

### **Production Upgrades:**

**Database:**
- MongoDB (NoSQL for file metadata)
- PostgreSQL (SQL for structured data)

**File Storage:**
- AWS S3
- Azure Blob Storage
- Google Cloud Storage

**Authentication:**
- JWT (JSON Web Tokens)
- OAuth 2.0
- Passport.js

**Caching:**
- Redis (in-memory cache)
- CDN for static files

---

## 🎯 Summary: Technologies Per Feature

| Feature | Frontend Tech | Backend Tech | Additional |
|---------|--------------|--------------|------------|
| **Drag & Drop Upload** | HTML5 Drag API, React useState | Multer, Express | FormData, Fetch |
| **File Storage** | - | Node.js fs, path, UUID | Disk storage |
| **OCR Extraction** | Fetch API, useState | Express routes, Math.random | (Mock OCR) |
| **Statistics** | useState, filter/reduce | Array methods | Real-time |
| **Search** | Controlled inputs, filter | - | Client-side |
| **Preview Modal** | Conditional render, img, iframe | Static file serving | CSS position |
| **Export CSV/JSON** | Blob API, createElement | String manipulation | File download |
| **Routing** | React Router | Express routing | SPA navigation |
| **Styling** | CSS3 (Grid, Flexbox, Gradients) | - | Responsive design |
| **API Communication** | Fetch API | Express middleware | CORS, JSON |

---

## 🏁 Conclusion

This dashboard uses a modern, full-stack JavaScript architecture with:
- **Frontend:** React ecosystem (React, Router, Hooks)
- **Backend:** Node.js ecosystem (Express, Multer)
- **Communication:** RESTful API with Fetch
- **Storage:** File system (upgradable to cloud)
- **Styling:** Modern CSS3
- **Build Tools:** Vite (frontend), Nodemon (backend)

**Total Technologies: 20+ core technologies + numerous APIs and features**
