const API_URL = 'http://localhost:5000/api';

export const api = {
  // Upload files
  uploadFiles: async (files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    return response.json();
  },

  // Get all files
  getFiles: async () => {
    const response = await fetch(`${API_URL}/files`);
    return response.json();
  },

  // Get single file
  getFile: async (id) => {
    const response = await fetch(`${API_URL}/files/${id}`);
    return response.json();
  },

  // Delete file
  deleteFile: async (id) => {
    const response = await fetch(`${API_URL}/files/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Extract data
  extractData: async (id) => {
    const response = await fetch(`${API_URL}/extract/${id}`, {
      method: 'POST',
    });
    return response.json();
  },

  // Get statistics
  getStats: async () => {
    const response = await fetch(`${API_URL}/stats`);
    return response.json();
  },

  // Export data
  exportJSON: async () => {
    const response = await fetch(`${API_URL}/export/json`);
    return response.json();
  },

  exportCSV: async () => {
    const response = await fetch(`${API_URL}/export/csv`);
    const blob = await response.blob();
    return blob;
  }
};
