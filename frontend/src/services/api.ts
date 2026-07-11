const API_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('savora_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Authentication
  async login(payload: any) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to login');
    return data;
  },

  async getCurrentUser() {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch user');
    return data;
  },

  async updateProfile(payload: any) {
    const res = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');
    return data;
  },

  // Categories CRUD
  async getCategories() {
    const res = await fetch(`${API_URL}/categories`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch categories');
    return data;
  },

  async addCategory(payload: any) {
    const res = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add category');
    return data;
  },

  async updateCategory(id: number, payload: any) {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update category');
    return data;
  },

  async deleteCategory(id: number) {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete category');
    return data;
  },

  // Products CRUD
  async getProducts(params?: { search?: string; categoryId?: number; status?: string }) {
    let url = `${API_URL}/products`;
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.categoryId) searchParams.append('categoryId', String(params.categoryId));
    if (params?.status) searchParams.append('status', params.status);

    const query = searchParams.toString();
    if (query) url += `?${query}`;

    const res = await fetch(url, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch products');
    return data;
  },

  async addProduct(payload: any) {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add product');
    return data;
  },

  async updateProduct(id: number, payload: any) {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update product');
    return data;
  },

  async deleteProduct(id: number) {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete product');
    return data;
  },

  async toggleProductStatus(id: number, status: string) {
    const res = await fetch(`${API_URL}/products/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update status');
    return data;
  },

  async uploadProductImage(file: File) {
    const token = localStorage.getItem('savora_token');
    const formData = new FormData();
    formData.append('image', file);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload image');
    return data;
  },

  // Cashier Accounts CRUD
  async getCashiers() {
    const res = await fetch(`${API_URL}/cashiers`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch cashiers');
    return data;
  },

  async addCashier(payload: any) {
    const res = await fetch(`${API_URL}/cashiers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add cashier');
    return data;
  },

  async updateCashier(id: number, payload: any) {
    const res = await fetch(`${API_URL}/cashiers/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update cashier');
    return data;
  },

  async deleteCashier(id: number) {
    const res = await fetch(`${API_URL}/cashiers/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete cashier');
    return data;
  },

  async resetCashierPassword(id: number, payload: any) {
    const res = await fetch(`${API_URL}/cashiers/${id}/reset-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
    return data;
  },

  // Billing API
  async createBill(payload: any) {
    const res = await fetch(`${API_URL}/bills`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save bill');
    return data;
  },

  async getBills(filter?: string) {
    let url = `${API_URL}/bills`;
    if (filter) url += `?filter=${filter}`;
    const res = await fetch(url, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch billing history');
    return data;
  },

  async getBillDetails(id: number) {
    const res = await fetch(`${API_URL}/bills/${id}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch bill details');
    return data;
  },

  // Reports, Database, and Dashboard aggregation stats
  async getStats() {
    const res = await fetch(`${API_URL}/stats`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch reports statistics');
    return data;
  },

  // Clear operations
  async clearDatabase(target: string, password: any) {
    const res = await fetch(`${API_URL}/database/clear`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ target, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to perform database operation');
    return data;
  },

  async listBackups() {
    const res = await fetch(`${API_URL}/database/backups`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to list backups');
    return data;
  },

  async createBackup() {
    const res = await fetch(`${API_URL}/database/backups`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create backup');
    return data;
  },

  async restoreBackup(backupName: string) {
    const res = await fetch(`${API_URL}/database/backups/restore`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ backupName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to restore backup');
    return data;
  },

  async deleteBackup(backupName: string) {
    const res = await fetch(`${API_URL}/database/backups/${backupName}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete backup');
    return data;
  }
};
