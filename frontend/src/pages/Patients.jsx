import { useEffect, useState } from 'react';
import { patientService } from '../services/patientService';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '', date_of_birth: '', phone: '', email: '',
    address: '', category: 'umum', blood_type: '', emergency_contact: '',
  });

  useEffect(() => { loadPatients(); }, []);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const response = await patientService.getAllPatients();
      setPatients(response.data || []);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await patientService.registerPatient(formData);
      setShowForm(false);
      setFormData({ name: '', date_of_birth: '', phone: '', email: '', address: '', category: 'umum', blood_type: '', emergency_contact: '' });
      loadPatients();
    } catch (err) {
      alert('Failed to register patient: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  const categoryColor = {
    umum: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    bpjs: 'bg-green-500/10 text-green-600 dark:text-green-400',
    asuransi: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  };

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Patients</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage patient registrations</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn bg-violet-500 hover:bg-violet-600 text-white mt-4 sm:mt-0"
        >
          <svg className="fill-current shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16">
            <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1Z" />
          </svg>
          Register Patient
        </button>
      </div>

      {/* Registration Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-5">New Patient Registration</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Full Name *</label>
              <input type="text" required value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="form-input" placeholder="Patient full name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Date of Birth *</label>
              <input type="date" required value={formData.date_of_birth}
                onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="form-input" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Phone</label>
              <input type="tel" value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="form-input" placeholder="08xxxxxxxxxx" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="form-input" placeholder="patient@email.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
              <select value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="form-select">
                <option value="umum">Umum</option>
                <option value="bpjs">BPJS</option>
                <option value="asuransi">Asuransi</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Blood Type</label>
              <select value={formData.blood_type}
                onChange={e => setFormData({ ...formData, blood_type: e.target.value })}
                className="form-select">
                <option value="">Select...</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Address</label>
              <textarea rows="2" value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="form-textarea" placeholder="Patient address" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Emergency Contact</label>
              <input type="text" value={formData.emergency_contact}
                onChange={e => setFormData({ ...formData, emergency_contact: e.target.value })}
                className="form-input" placeholder="Name & Phone" />
            </div>
            <div className="md:col-span-2 flex space-x-3 pt-2">
              <button type="submit" className="btn bg-violet-500 hover:bg-violet-600 text-white">Save Patient</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600">Cancel</button>
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
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="form-input pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-auto w-full">
            <thead className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900/20 border-b border-gray-100 dark:border-gray-700/60">
              <tr>
                <th className="px-5 py-3 text-left whitespace-nowrap">ID</th>
                <th className="px-5 py-3 text-left whitespace-nowrap">Name</th>
                <th className="px-5 py-3 text-left whitespace-nowrap">Date of Birth</th>
                <th className="px-5 py-3 text-left whitespace-nowrap">Phone</th>
                <th className="px-5 py-3 text-left whitespace-nowrap">Category</th>
                <th className="px-5 py-3 text-left whitespace-nowrap">Registered</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
              {loading ? (
                <tr><td colSpan="6" className="px-5 py-8 text-center text-gray-400 dark:text-gray-500">Loading...</td></tr>
              ) : filteredPatients.length === 0 ? (
                <tr><td colSpan="6" className="px-5 py-8 text-center text-gray-400 dark:text-gray-500">No patients found</td></tr>
              ) : (
                filteredPatients.map(patient => (
                  <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">#{patient.id}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-violet-500">{patient.name?.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-100">{patient.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">{patient.phone || '-'}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${categoryColor[patient.category] || categoryColor.umum}`}>
                        {patient.category || 'umum'}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {patient.registration_date ? new Date(patient.registration_date).toLocaleDateString('id-ID') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
