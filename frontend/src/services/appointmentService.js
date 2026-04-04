import api from './api';

export const appointmentService = {
  async getAllAppointments(filters = {}) {
    const params = new URLSearchParams();
    if (filters.patient_id) params.append('patient_id', filters.patient_id);
    if (filters.doctor_name) params.append('doctor_name', filters.doctor_name);
    if (filters.status) params.append('status', filters.status);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);

    const response = await api.get(`/appointments?${params.toString()}`);
    return response.data;
  },

  async getAppointmentById(id) {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  async createAppointment(appointmentData) {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  async updateAppointment(id, updates) {
    const response = await api.put(`/appointments/${id}`, updates);
    return response.data;
  },

  async getAllDoctors() {
    const response = await api.get('/doctors');
    return response.data;
  },

  async createDoctor(doctorData) {
    const response = await api.post('/doctors', doctorData);
    return response.data;
  }
};
