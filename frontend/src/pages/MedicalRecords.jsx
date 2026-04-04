import { useEffect, useState } from 'react';
import { medicalRecordService } from '../services/medicalRecordService';
import { patientService } from '../services/patientService';
import { useAuth } from '../contexts/AuthContext';

export default function MedicalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showRxForm, setShowRxForm] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: '', patient_name: '', date_of_birth: '',
    diagnosis: '', treatment: '', doctor_name: '',
    visit_date: '', notes: '', chief_complaint: '', follow_up_date: '',
  });
  const [rxForm, setRxForm] = useState({
    medication_name: '', dosage: '', frequency: '',
    duration_days: '', quantity: '', instructions: '',
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recRes, patRes] = await Promise.all([
        medicalRecordService.getAll(),
        patientService.getAllPatients(),
      ]);
      setRecords(recRes.data || []);
      setPatients(patRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (e) => {
    const patient = patients.find(p => p.id === parseInt(e.target.value));
    if (patient) {
      setFormData(prev => ({
        ...prev,
        patient_id: patient.id,
        patient_name: patient.name,
        date_of_birth: patient.date_of_birth?.split('T')[0] || '',
      }));
    } else {
      setFormData(prev => ({ ...prev, patient_id: '', patient_name: '', date_of_birth: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await medicalRecordService.create({
        ...formData,
        doctor_name: formData.doctor_name || user.full_name,
        visit_date: formData.visit_date || new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
      setFormData({ patient_id: '', patient_name: '', date_of_birth: '', diagnosis: '', treatment: '', doctor_name: '', visit_date: '', notes: '', chief_complaint: '', follow_up_date: '' });
      loadData();
    } catch (err) {
      alert('Gagal: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddRx = async (e, recordId, patientId) => {
    e.preventDefault();
    try {
      await medicalRecordService.createPrescription({
        ...rxForm,
        medical_record_id: recordId,
        patient_id: patientId,
        duration_days: parseInt(rxForm.duration_days),
        quantity: parseInt(rxForm.quantity),
      });
      setShowRxForm(null);
      setRxForm({ medication_name: '', dosage: '', frequency: '', duration_days: '', quantity: '', instructions: '' });
      loadData();
    } catch (err) {
      alert('Gagal: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredRecords = records.filter(r =>
    r.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusStyle = {
    draft: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    active: 'bg-green-500/10 text-green-600 dark:text-green-400',
    closed: 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
  };

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Medical Records</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Rekam medis pasien</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn bg-violet-500 hover:bg-violet-600 text-white mt-4 sm:mt-0"
        >
          <svg className="fill-current shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16">
            <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1Z" />
          </svg>
          Buat Rekam Medis
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-5">Rekam Medis Baru</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Pilih Pasien *</label>
              <select required value={formData.patient_id} onChange={handlePatientSelect} className="form-select">
                <option value="">-- Pilih Pasien --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Keluhan Utama</label>
              <input type="text" value={formData.chief_complaint}
                onChange={e => setFormData({ ...formData, chief_complaint: e.target.value })}
                className="form-input" placeholder="Keluhan pasien" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Tanggal Kunjungan</label>
              <input type="date" value={formData.visit_date}
                onChange={e => setFormData({ ...formData, visit_date: e.target.value })}
                className="form-input" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Nama Dokter</label>
              <input type="text" value={formData.doctor_name} placeholder={user.full_name}
                onChange={e => setFormData({ ...formData, doctor_name: e.target.value })}
                className="form-input" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Follow-up</label>
              <input type="date" value={formData.follow_up_date}
                onChange={e => setFormData({ ...formData, follow_up_date: e.target.value })}
                className="form-input" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Diagnosis</label>
              <textarea rows="2" value={formData.diagnosis}
                onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
                className="form-textarea" placeholder="Diagnosis..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Treatment</label>
              <textarea rows="2" value={formData.treatment}
                onChange={e => setFormData({ ...formData, treatment: e.target.value })}
                className="form-textarea" placeholder="Tindakan / treatment..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Catatan</label>
              <textarea rows="2" value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="form-textarea" placeholder="Catatan tambahan..." />
            </div>
            <div className="md:col-span-2 flex space-x-3 pt-2">
              <button type="submit" className="btn bg-violet-500 hover:bg-violet-600 text-white">Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-4 mb-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 fill-current text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7ZM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5Zm8.707 10.293a.999.999 0 1 1-1.414 1.414L11.9 11.314a8.019 8.019 0 0 0 1.414-1.414l2.393 2.393Z" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama pasien, dokter, atau diagnosis..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="form-input pl-9"
          />
        </div>
      </div>

      {/* Records */}
      <div className="space-y-2">
        {loading ? (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-8 text-center text-gray-400 dark:text-gray-500">Loading...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-8 text-center text-gray-400 dark:text-gray-500">Tidak ada rekam medis</div>
        ) : (
          filteredRecords.map(record => (
            <div key={record.id} className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
              {/* Row header */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors"
                onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-violet-500">{record.patient_name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{record.patient_name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {record.doctor_name || '-'} &bull; {record.visit_date ? new Date(record.visit_date).toLocaleDateString('id-ID') : '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 ml-4 shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyle[record.status] || statusStyle.draft}`}>
                    {record.status || 'draft'}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">#{record.id}</span>
                  <svg
                    className={`fill-current text-gray-400 dark:text-gray-500 shrink-0 transition-transform duration-200 ${expandedId === record.id ? 'rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"
                  >
                    <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
                  </svg>
                </div>
              </div>

              {/* Expanded detail */}
              {expandedId === record.id && (
                <div className="border-t border-gray-100 dark:border-gray-700/60 px-5 py-4 bg-gray-50 dark:bg-gray-900/20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {record.chief_complaint && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Keluhan</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{record.chief_complaint}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Diagnosis</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{record.diagnosis || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Treatment</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{record.treatment || '-'}</p>
                    </div>
                    {record.notes && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Catatan</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{record.notes}</p>
                      </div>
                    )}
                    {record.follow_up_date && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Follow-up</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{new Date(record.follow_up_date).toLocaleDateString('id-ID')}</p>
                      </div>
                    )}
                  </div>

                  {/* Prescription */}
                  {(user.role === 'doctor' || user.role === 'admin') && (
                    <div className="mt-2 pt-3 border-t border-gray-200 dark:border-gray-700/60">
                      {showRxForm === record.id ? (
                        <form onSubmit={(e) => handleAddRx(e, record.id, record.patient_id)} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Tambah Resep</p>
                            <button type="button" onClick={() => setShowRxForm(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                              <svg className="fill-current w-4 h-4" viewBox="0 0 16 16"><path d="M12.72 3.293 8 8.013 3.28 3.293a1 1 0 0 0-1.414 1.414L6.586 9.43l-4.72 4.723a1 1 0 1 0 1.414 1.414L8 10.845l4.72 4.722a1 1 0 1 0 1.414-1.414L9.414 9.43l4.72-4.723a1 1 0 0 0-1.414-1.414Z" /></svg>
                            </button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Nama Obat *</label>
                              <input required type="text" value={rxForm.medication_name}
                                onChange={e => setRxForm({ ...rxForm, medication_name: e.target.value })}
                                className="form-input text-xs py-1.5" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Dosis *</label>
                              <input required type="text" placeholder="500mg" value={rxForm.dosage}
                                onChange={e => setRxForm({ ...rxForm, dosage: e.target.value })}
                                className="form-input text-xs py-1.5" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Frekuensi *</label>
                              <input required type="text" placeholder="3x sehari" value={rxForm.frequency}
                                onChange={e => setRxForm({ ...rxForm, frequency: e.target.value })}
                                className="form-input text-xs py-1.5" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Durasi (hari) *</label>
                              <input required type="number" min="1" value={rxForm.duration_days}
                                onChange={e => setRxForm({ ...rxForm, duration_days: e.target.value })}
                                className="form-input text-xs py-1.5" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Jumlah *</label>
                              <input required type="number" min="1" value={rxForm.quantity}
                                onChange={e => setRxForm({ ...rxForm, quantity: e.target.value })}
                                className="form-input text-xs py-1.5" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Instruksi</label>
                              <input type="text" placeholder="Setelah makan" value={rxForm.instructions}
                                onChange={e => setRxForm({ ...rxForm, instructions: e.target.value })}
                                className="form-input text-xs py-1.5" />
                            </div>
                          </div>
                          <button type="submit" className="btn-sm bg-violet-500 hover:bg-violet-600 text-white mt-3">Simpan Resep</button>
                        </form>
                      ) : (
                        <button
                          onClick={() => setShowRxForm(record.id)}
                          className="inline-flex items-center text-sm text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition-colors"
                        >
                          <svg className="fill-current mr-1.5" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16">
                            <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1Z" />
                          </svg>
                          Tambah Resep
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
