import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { patientService } from '../services/patientService';
import { medicalRecordService } from '../services/medicalRecordService';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ patients: 0, medicalRecords: 0, loading: true });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [patientsRes, recordsRes] = await Promise.all([
        patientService.getAllPatients().catch(() => null),
        medicalRecordService.getAll().catch(() => null),
      ]);
      setStats({
        patients: patientsRes?.count ?? 0,
        medicalRecords: recordsRes?.count ?? 0,
        loading: false,
      });
    } catch {
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const statCards = [
    {
      name: 'Total Patients',
      value: stats.patients,
      icon: (
        <svg className="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16">
          <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7ZM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5Z" />
          <path d="M15.443 13.38 13.38 15.443a1 1 0 0 1-1.414-1.414l2.063-2.063a1 1 0 1 1 1.414 1.414Z" />
        </svg>
      ),
      color: 'text-violet-500',
      bg: 'bg-violet-500/10 dark:bg-violet-500/20',
      visible: ['admin', 'doctor', 'nurse'].includes(user?.role),
      action: () => navigate('/patients'),
    },
    {
      name: 'Medical Records',
      value: stats.medicalRecords,
      icon: (
        <svg className="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16">
          <path d="M13.95.879a3 3 0 0 0-4.243 0L1.293 9.293a1 1 0 0 0-.274.51l-1 5a1 1 0 0 0 1.177 1.177l5-1a1 1 0 0 0 .511-.273l8.414-8.414a3 3 0 0 0 0-4.242L13.95.879ZM11.12 2.293a1 1 0 0 1 1.414 0l1.172 1.172a1 1 0 0 1 0 1.414l-8.2 8.2-3.232.646.646-3.232 8.2-8.2Z" />
        </svg>
      ),
      color: 'text-sky-500',
      bg: 'bg-sky-500/10 dark:bg-sky-500/20',
      visible: ['admin', 'doctor'].includes(user?.role),
      action: () => navigate('/medical-records'),
    },
    {
      name: 'System Status',
      value: 'Active',
      icon: (
        <svg className="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16">
          <path d="M7.001 3a1 1 0 0 1 2 0l-.005 5.493 3.504 3.504a1 1 0 0 1-1.414 1.414l-3.5-3.5A1 1 0 0 1 7 9.5L7.001 3Z" />
          <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16Zm0-2a6 6 0 1 0 0-12A6 6 0 0 0 2 8a6 6 0 0 0 6 6Z" />
        </svg>
      ),
      color: 'text-green-500',
      bg: 'bg-green-500/10 dark:bg-green-500/20',
      visible: true,
    },
  ].filter(c => c.visible);

  return (
    <div>
      {/* Page header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.full_name}!</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => (
          <div
            key={card.name}
            onClick={card.action}
            className={`bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5 ${card.action ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg} ${card.color}`}>
                {card.icon}
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{card.name}</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              {stats.loading ? (
                <span className="inline-block w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6 mb-8">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {['admin', 'nurse', 'doctor'].includes(user?.role) && (
            <button
              onClick={() => navigate('/patients')}
              className="group flex items-start space-x-4 p-4 border-2 border-gray-100 dark:border-gray-700/60 rounded-xl hover:border-violet-300 dark:hover:border-violet-500/50 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all duration-150 text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0 group-hover:bg-violet-500 group-hover:text-white transition-colors duration-150">
                <svg className="fill-current" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                  <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1Z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">Register New Patient</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Add a new patient to the system</p>
              </div>
            </button>
          )}
          {['admin', 'doctor'].includes(user?.role) && (
            <button
              onClick={() => navigate('/medical-records')}
              className="group flex items-start space-x-4 p-4 border-2 border-gray-100 dark:border-gray-700/60 rounded-xl hover:border-sky-300 dark:hover:border-sky-500/50 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-all duration-150 text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-150">
                <svg className="fill-current" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                  <path d="M13.95.879a3 3 0 0 0-4.243 0L1.293 9.293a1 1 0 0 0-.274.51l-1 5a1 1 0 0 0 1.177 1.177l5-1a1 1 0 0 0 .511-.273l8.414-8.414a3 3 0 0 0 0-4.242L13.95.879Z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">View Medical Records</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Access comprehensive patient histories</p>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-500 rounded-xl p-6 text-white">
        <h3 className="text-lg font-bold mb-1">Hospital Management System</h3>
        <p className="text-violet-100 text-sm">Manage hospital operations efficiently with our integrated microservices platform.</p>
      </div>
    </div>
  );
}
