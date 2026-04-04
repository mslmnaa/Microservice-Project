import api from './api';

export const patientService = {
  async getAllPatients() {
    const response = await api.get('/pasien');
    return response.data;
  },

  async getPatientById(id) {
    const response = await api.get(`/pasien/${id}`);
    return response.data;
  },

  async registerPatient(patientData) {
    const response = await api.post('/daftar', patientData);
    return response.data;
  }
};
