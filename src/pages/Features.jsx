import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import './Features.css'

function Features() {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [previewFile, setPreviewFile] = useState(null)
  const [extractedData, setExtractedData] = useState({})

  // Cleanup object URLs on unmount
  useEffect(() => {
    // Load files from backend on mount
    loadFiles();
    
    return () => {
      uploadedFiles.forEach(file => {
        if (file.url && file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url)
        }
      })
    }
  }, [])

  const loadFiles = async () => {
    try {
      const response = await api.getFiles()
      if (response.success) {
        setUploadedFiles(response.files)
      }
    } catch (error) {
      console.error('Error loading files:', error)
      alert('Failed to load files from server')
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = async (files) => {
    setProcessing(true)
    
    try {
      const response = await api.uploadFiles(files)
      
      if (response.success) {
        setUploadedFiles(prev => [...prev, ...response.files])
        alert(`${response.files.length} file(s) uploaded successfully!`)
      } else {
        alert('Failed to upload files: ' + response.message)
      }
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Error uploading files. Make sure the backend server is running on http://localhost:5000')
    } finally {
      setProcessing(false)
    }
  }

  const viewFile = (fileData) => {
    // Open file in new tab
    window.open(fileData.url, '_blank')
  }

  const downloadFile = (fileData) => {
    // Download file from server
    const link = document.createElement('a')
    link.href = fileData.url
    link.download = fileData.name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const extractData = async (fileData) => {
    setProcessing(true)
    
    try {
      const response = await api.extractData(fileData.id)
      
      if (response.success) {
        // Update file with extracted data
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, extractedData: response.data, status: 'Processed' }
            : f
        ))
        setExtractedData(prev => ({ ...prev, [fileData.id]: response.data }))
        
        alert(`Data extracted from ${fileData.name}!\n\nVendor: ${response.data.vendor}\nTotal: ${response.data.total}\nDate: ${response.data.date}\nInvoice #: ${response.data.invoiceNumber}`)
      } else {
        alert('Failed to extract data: ' + response.message)
      }
    } catch (error) {
      console.error('Error extracting data:', error)
      alert('Error extracting data. Make sure the backend server is running.')
    } finally {
      setProcessing(false)
    }
  }

  const exportToJSON = async () => {
    try {
      const data = await api.exportJSON()
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `receipts-export-${Date.now()}.json`
      link.click()
    } catch (error) {
      console.error('Error exporting JSON:', error)
      alert('Error exporting data')
    }
  }

  const exportToCSV = async () => {
    try {
      const blob = await api.exportCSV()
      
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `receipts-export-${Date.now()}.csv`
      link.click()
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Error exporting data')
    }
  }

  const filteredFiles = uploadedFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'All' || file.type === filterType
    return matchesSearch && matchesType
  })

  const stats = {
    total: uploadedFiles.length,
    images: uploadedFiles.filter(f => f.type === 'Image').length,
    pdfs: uploadedFiles.filter(f => f.type === 'PDF').length,
    documents: uploadedFiles.filter(f => f.type === 'Document').length
  }

  const removeFile = async (id) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return
    }
    
    try {
      const response = await api.deleteFile(id)
      
      if (response.success) {
        setUploadedFiles(prev => prev.filter(file => file.id !== id))
        setExtractedData(prev => {
          const newData = { ...prev }
          delete newData[id]
          return newData
        })
        alert('File deleted successfully')
      } else {
        alert('Failed to delete file: ' + response.message)
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Error deleting file')
    }
  }

  return (
    <div className="features">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo">📄 DigiDoc</h1>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/features" className="nav-link">Features</Link>
          </div>
        </div>
      </nav>

      <main className="features-main">
        <div className="features-container">
          <h1 className="page-title">Upload Your Documents</h1>
          <p className="page-subtitle">
            Drag and drop your receipts or invoices, or click to browse
          </p>

          {uploadedFiles.length > 0 && (
            <div className="stats-bar">
              <div className="stat-item">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Total Files</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.images}</span>
                <span className="stat-label">Images</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.pdfs}</span>
                <span className="stat-label">PDFs</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.documents}</span>
                <span className="stat-label">Documents</span>
              </div>
            </div>
          )}

          <div 
            className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="file-input"
              multiple
              accept="image/*,.pdf"
              onChange={handleChange}
            />
            <label htmlFor="file-upload" className="upload-label">
              <div className="upload-icon">📤</div>
              <h3>Drop files here or click to upload</h3>
              <p>Supports: Images (JPG, PNG) and PDF documents</p>
            </label>
          </div>

          {processing && (
            <div className="processing-indicator">
              <div className="spinner"></div>
              <p>Processing your documents...</p>
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className="uploaded-files">
              <div className="files-header">
                <h2>Uploaded Documents</h2>
                <div className="files-controls">
                  <input
                    type="text"
                    placeholder="🔍 Search files..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <select 
                    className="filter-select"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="All">All Types</option>
                    <option value="Image">Images</option>
                    <option value="PDF">PDFs</option>
                    <option value="Document">Documents</option>
                  </select>
                  <button className="export-btn" onClick={exportToCSV}>Export CSV</button>
                  <button className="export-btn" onClick={exportToJSON}>Export JSON</button>
                </div>
              </div>
              <div className="files-grid">
                {filteredFiles.map(file => (
                  <div key={file.id} className="file-card">
                    <div className="file-header">
                      <span className="file-type-badge">{file.type}</span>
                      <button 
                        className="remove-btn"
                        onClick={() => removeFile(file.id)}
                        title="Remove file"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="file-icon">📄</div>
                    <h4 className="file-name">{file.name}</h4>
                    <div className="file-details">
                      <span className="file-size">{file.size}</span>
                      <span className="file-status success">{file.status}</span>
                    </div>
                    <p className="file-date">{new Date(file.uploadedAt).toLocaleString()}</p>
                    <div className="file-actions">
                      <button className="action-btn" onClick={() => setPreviewFile(file)}>Preview</button>
                      <button className="action-btn" onClick={() => downloadFile(file)}>Download</button>
                      <button 
                        className="action-btn primary" 
                        onClick={() => extractData(file)}
                        disabled={processing}
                      >
                        {extractedData[file.id] ? '✓ Extracted' : 'Extract Data'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadedFiles.length === 0 && !processing && (
            <div className="empty-state">
              <p>No documents uploaded yet. Start by uploading your first receipt or invoice!</p>
            </div>
          )}

          {filteredFiles.length === 0 && uploadedFiles.length > 0 && (
            <div className="empty-state">
              <p>No files match your search criteria.</p>
            </div>
          )}
        </div>
      </main>

      {previewFile && (
        <div className="modal-overlay" onClick={() => setPreviewFile(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPreviewFile(null)}>✕</button>
            <h3>{previewFile.name}</h3>
            <div className="preview-container">
              {previewFile.type === 'Image' ? (
                <img src={previewFile.url} alt={previewFile.name} className="preview-image" />
              ) : previewFile.type === 'PDF' ? (
                <iframe src={previewFile.url} className="preview-iframe" title={previewFile.name}></iframe>
              ) : (
                <p>Preview not available for this file type</p>
              )}
            </div>
            {extractedData[previewFile.id] && (
              <div className="extracted-info">
                <h4>📊 Extracted Data:</h4>
                <div className="data-grid">
                  <div><strong>Vendor:</strong> {extractedData[previewFile.id].vendor}</div>
                  <div><strong>Date:</strong> {extractedData[previewFile.id].date}</div>
                  <div><strong>Total:</strong> {extractedData[previewFile.id].total}</div>
                  <div><strong>Category:</strong> {extractedData[previewFile.id].category}</div>
                </div>
              </div>
            )}
            <div className="modal-actions">
              <button className="modal-btn" onClick={() => downloadFile(previewFile)}>Download</button>
              <button className="modal-btn" onClick={() => viewFile(previewFile)}>Open in New Tab</button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>&copy; 2026 DigiDoc. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Features
