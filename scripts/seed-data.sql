-- Service A: seed-data.sql
-- Insert default users (passwords are hashed with bcrypt for: admin123, doctor123, nurse123)

-- Admin user: admin@hospital.com / admin123
INSERT INTO users (email, password_hash, full_name, role, phone)
VALUES (
  'admin@hospital.com',
  '$2b$10$BjaWxR2z7ZGHypDriBAoceW1KLeGd.l0lsTazxhdwfAOukwEWCjxi',
  'Admin Hospital',
  'admin',
  '081234567890'
) ON CONFLICT (email) DO NOTHING;

-- Doctor user: doctor@hospital.com / doctor123
INSERT INTO users (email, password_hash, full_name, role, phone)
VALUES (
  'doctor@hospital.com',
  '$2b$10$rKY9zyRZeNwbb8t8L4XNH.1Fp.sjSlAWT91BSUsuXo22o2WwEDm5C',
  'Dr. John Smith',
  'doctor',
  '081234567891'
) ON CONFLICT (email) DO NOTHING;

-- Nurse user: nurse@hospital.com / nurse123
INSERT INTO users (email, password_hash, full_name, role, phone)
VALUES (
  'nurse@hospital.com',
  '$2b$10$XtTQVbhEajLFuzXI/99c1eWoNCmt0gQrOi0XSIpWhQQd24bPqsg8W',
  'Nurse Mary Johnson',
  'nurse',
  '081234567892'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample doctors
INSERT INTO doctors (name, specialization, email, phone, available_days, start_time, end_time)
VALUES
  ('Dr. Sarah Williams', 'Cardiology', 'sarah.williams@hospital.com', '081234567893', ARRAY['Monday', 'Tuesday', 'Wednesday', 'Friday'], '08:00:00', '16:00:00'),
  ('Dr. Michael Brown', 'Pediatrics', 'michael.brown@hospital.com', '081234567894', ARRAY['Monday', 'Wednesday', 'Thursday', 'Friday'], '09:00:00', '17:00:00'),
  ('Dr. Emily Davis', 'Dermatology', 'emily.davis@hospital.com', '081234567895', ARRAY['Tuesday', 'Thursday', 'Friday'], '08:00:00', '15:00:00'),
  ('Dr. James Wilson', 'Orthopedics', 'james.wilson@hospital.com', '081234567896', ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '07:00:00', '14:00:00'),
  ('Dr. Linda Martinez', 'Neurology', 'linda.martinez@hospital.com', '081234567897', ARRAY['Monday', 'Wednesday', 'Friday'], '10:00:00', '18:00:00')
ON CONFLICT DO NOTHING;

-- Insert sample patients (optional for testing)
INSERT INTO patients (name, date_of_birth, phone, email, address, category, blood_type, emergency_contact)
VALUES
  ('Ahmad Rizki', '1985-03-15', '081234560001', 'ahmad.rizki@email.com', 'Jl. Sudirman No. 123, Jakarta', 'umum', 'A+', 'Siti (081234560002)'),
  ('Budi Santoso', '1990-07-22', '081234560003', 'budi.santoso@email.com', 'Jl. Gatot Subroto No. 456, Jakarta', 'bpjs', 'B+', 'Ani (081234560004)'),
  ('Citra Dewi', '1978-11-08', '081234560005', 'citra.dewi@email.com', 'Jl. Thamrin No. 789, Jakarta', 'asuransi', 'O+', 'Rudi (081234560006)'),
  ('Dewi Lestari', '1995-05-30', '081234560007', 'dewi.lestari@email.com', 'Jl. Kuningan No. 321, Jakarta', 'umum', 'AB+', 'Hadi (081234560008)'),
  ('Eko Prasetyo', '1982-09-14', '081234560009', 'eko.prasetyo@email.com', 'Jl. Senayan No. 654, Jakarta', 'bpjs', 'A-', 'Wati (081234560010)')
ON CONFLICT DO NOTHING;
