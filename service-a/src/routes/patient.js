const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { checkMedicalRecord } = require('../grpc/client');
const { publishPatientRegistration } = require('../rabbitmq/publisher');

router.post('/daftar', async (req, res) => {
  const { name, date_of_birth, address, phone, email } = req.body;

  if (!name || !date_of_birth) {
    return res.status(400).json({
      success: false,
      message: 'Nama dan tanggal lahir wajib diisi'
    });
  }

  try {
    let grpcResponse = null;
    let hasMedicalRecord = false;
    let lastVisitDate = null;

    try {
      grpcResponse = await checkMedicalRecord(name, date_of_birth);
      hasMedicalRecord = grpcResponse.has_record;
      lastVisitDate = grpcResponse.last_visit_date || null;
      console.log('gRPC Response:', grpcResponse);
    } catch (grpcError) {
      console.error('gRPC call failed, continuing with registration:', grpcError.message);
    }

    const insertQuery = `
      INSERT INTO patients (name, date_of_birth, address, phone, email, has_medical_record, last_visit_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [name, date_of_birth, address, phone, email, hasMedicalRecord, lastVisitDate];
    const result = await pool.query(insertQuery, values);
    const patient = result.rows[0];

    try {
      await publishPatientRegistration({
        id: patient.id,
        name: patient.name,
        date_of_birth: patient.date_of_birth,
        address: patient.address,
        phone: patient.phone,
        email: patient.email
      });
      console.log('Event published to RabbitMQ for patient:', patient.id);
    } catch (mqError) {
      console.error('Failed to publish to RabbitMQ:', mqError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Pasien berhasil didaftarkan',
      data: {
        patient: patient,
        medical_record_status: grpcResponse ? {
          has_record: hasMedicalRecord,
          last_visit_date: lastVisitDate,
          message: grpcResponse.message
        } : {
          has_record: false,
          message: 'Tidak dapat memverifikasi rekam medis'
        }
      }
    });

  } catch (error) {
    console.error('Error registering patient:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mendaftarkan pasien',
      error: error.message
    });
  }
});

router.get('/pasien', async (req, res) => {
  try {
    const query = 'SELECT * FROM patients ORDER BY registration_date DESC';
    const result = await pool.query(query);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data pasien',
      error: error.message
    });
  }
});

router.get('/pasien/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'SELECT * FROM patients WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pasien tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data pasien',
      error: error.message
    });
  }
});

module.exports = router;
