const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5434,
  database: process.env.DB_NAME || 'db_rekam_medis',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const initDatabase = async () => {
  try {
    // Create users table (shared auth)
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        patient_id INTEGER,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );
    `;

    const createUsersIndexes = `
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `;

    // Create medical_records table with extended fields
    const createMedicalRecordsTable = `
      CREATE TABLE IF NOT EXISTS medical_records (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL,
        patient_name VARCHAR(255) NOT NULL,
        date_of_birth DATE NOT NULL,
        diagnosis TEXT,
        treatment TEXT,
        doctor_name VARCHAR(255),
        visit_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        appointment_id INTEGER,
        status VARCHAR(50) DEFAULT 'draft',
        follow_up_date DATE,
        chief_complaint TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_patient_name_dob ON medical_records(patient_name, date_of_birth);
      CREATE INDEX IF NOT EXISTS idx_patient_id ON medical_records(patient_id);
      CREATE INDEX IF NOT EXISTS idx_status ON medical_records(status);
    `;

    // Create prescriptions table
    const createPrescriptionsTable = `
      CREATE TABLE IF NOT EXISTS prescriptions (
        id SERIAL PRIMARY KEY,
        medical_record_id INTEGER NOT NULL,
        patient_id INTEGER NOT NULL,
        prescribed_by VARCHAR(255) NOT NULL,
        medication_name VARCHAR(255) NOT NULL,
        dosage VARCHAR(100) NOT NULL,
        frequency VARCHAR(100) NOT NULL,
        duration_days INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        instructions TEXT,
        start_date DATE DEFAULT CURRENT_DATE,
        end_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_prescription_patient ON prescriptions(patient_id);
      CREATE INDEX IF NOT EXISTS idx_prescription_record ON prescriptions(medical_record_id);
      CREATE INDEX IF NOT EXISTS idx_prescription_status ON prescriptions(status);
    `;

    // Create vital_signs table
    const createVitalSignsTable = `
      CREATE TABLE IF NOT EXISTS vital_signs (
        id SERIAL PRIMARY KEY,
        medical_record_id INTEGER,
        patient_id INTEGER NOT NULL,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        blood_pressure_systolic INTEGER,
        blood_pressure_diastolic INTEGER,
        heart_rate INTEGER,
        temperature DECIMAL(4,2),
        respiratory_rate INTEGER,
        oxygen_saturation INTEGER,
        weight DECIMAL(5,2),
        height DECIMAL(5,2),
        bmi DECIMAL(4,2),
        notes TEXT,
        recorded_by VARCHAR(255)
      );

      CREATE INDEX IF NOT EXISTS idx_vitals_patient ON vital_signs(patient_id);
      CREATE INDEX IF NOT EXISTS idx_vitals_record ON vital_signs(medical_record_id);
      CREATE INDEX IF NOT EXISTS idx_vitals_date ON vital_signs(recorded_at);
    `;

    await pool.query(createUsersTable);
    await pool.query(createUsersIndexes);
    await pool.query(createMedicalRecordsTable);
    await pool.query(createPrescriptionsTable);
    await pool.query(createVitalSignsTable);

    console.log('Database Service B initialized successfully');
    console.log('Tables created: users, medical_records, prescriptions, vital_signs');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

module.exports = {
  pool,
  initDatabase
};
