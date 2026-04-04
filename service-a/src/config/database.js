const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  database: process.env.DB_NAME || 'db_pendaftaran',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const initDatabase = async () => {
  try {
    // Create users table for authentication
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

      CREATE INDEX IF NOT EXISTS idx_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_role ON users(role);
    `;

    // Create patients table with extended fields
    const createPatientsTable = `
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        date_of_birth DATE NOT NULL,
        address TEXT,
        phone VARCHAR(20),
        email VARCHAR(255),
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        has_medical_record BOOLEAN DEFAULT FALSE,
        last_visit_date VARCHAR(50),
        user_id INTEGER,
        category VARCHAR(50) DEFAULT 'umum',
        emergency_contact VARCHAR(255),
        blood_type VARCHAR(5)
      );
    `;

    // Create doctors table
    const createDoctorsTable = `
      CREATE TABLE IF NOT EXISTS doctors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        specialization VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        available_days TEXT[],
        start_time TIME DEFAULT '08:00:00',
        end_time TIME DEFAULT '17:00:00',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_doctor_name ON doctors(name);
      CREATE INDEX IF NOT EXISTS idx_specialization ON doctors(specialization);
    `;

    // Create appointments table
    const createAppointmentsTable = `
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL,
        doctor_name VARCHAR(255) NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        duration_minutes INTEGER DEFAULT 30,
        status VARCHAR(50) DEFAULT 'scheduled',
        reason TEXT,
        notes TEXT,
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_patient_appointments ON appointments(patient_id);
      CREATE INDEX IF NOT EXISTS idx_appointment_date ON appointments(appointment_date, appointment_time);
      CREATE INDEX IF NOT EXISTS idx_appointment_status ON appointments(status);
      CREATE INDEX IF NOT EXISTS idx_doctor_appointments ON appointments(doctor_name, appointment_date);
    `;

    await pool.query(createUsersTable);
    await pool.query(createPatientsTable);
    await pool.query(createDoctorsTable);
    await pool.query(createAppointmentsTable);

    console.log('Database Service A initialized successfully');
    console.log('Tables created: users, patients, doctors, appointments');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

module.exports = {
  pool,
  initDatabase
};
