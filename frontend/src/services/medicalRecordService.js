import axios from 'axios';

const apib = axios.create({
  baseURL: '/api/b',
  headers: { 'Content-Type': 'application/json' },
});

apib.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apib.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const medicalRecordService = {
  async getAll() {
    const response = await apib.get('/rekam-medis');
    return response.data;
  },

  async getByPatientId(patient_id) {
    const response = await apib.get(`/rekam-medis/${patient_id}`);
    return response.data;
  },

  async create(data) {
    const response = await apib.post('/rekam-medis', data);
    return response.data;
  },

  async update(patient_id, data) {
    const response = await apib.put(`/rekam-medis/${patient_id}`, data);
    return response.data;
  },

  async getPrescriptionsByPatient(patient_id) {
    const response = await apib.get(`/prescriptions/patient/${patient_id}`);
    return response.data;
  },

  async createPrescription(data) {
    const response = await apib.post('/prescriptions', data);
    return response.data;
  },
};
