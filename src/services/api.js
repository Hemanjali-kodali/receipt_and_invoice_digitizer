const API_URL = "http://localhost:8000";

export const api = {
  // Register
  register: async (data) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_name: data.name,
        user_email: data.email,
        user_password: data.password,
      }),
    });

    return response.json();
  },

  // Login
  login: async (data) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_email: data.email,
        user_password: data.password,
      }),
    });

    return response.json();
  },

  // Upload Invoice
  uploadInvoice: async (file, token) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/invoice/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return response.json();
  },
};