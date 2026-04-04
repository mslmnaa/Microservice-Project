const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/rekam-medis/:patient_id', async (req, res) => {
  const { patient_id } = req.params;

  try {
    const query = `
      SELECT * FROM medical_records
      WHERE patient_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [patient_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rekam medis tidak ditemukan untuk pasien ini'
      });
    }

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching medical record:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil rekam medis',
      error: error.message
    });
  }
});

router.get('/rekam-medis', async (req, res) => {
  try {
    const query = `
      SELECT * FROM medical_records
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil rekam medis',
      error: error.message
    });
  }
});

router.put('/rekam-medis/:patient_id', async (req, res) => {
  const { patient_id } = req.params;
  const { diagnosis, treatment, doctor_name, visit_date, notes } = req.body;

  try {
    const checkQuery = 'SELECT * FROM medical_records WHERE patient_id = $1';
    const checkResult = await pool.query(checkQuery, [patient_id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rekam medis tidak ditemukan untuk pasien ini'
      });
    }

    const recordId = checkResult.rows[0].id;

    const updateQuery = `
      UPDATE medical_records
      SET
        diagnosis = COALESCE($1, diagnosis),
        treatment = COALESCE($2, treatment),
        doctor_name = COALESCE($3, doctor_name),
        visit_date = COALESCE($4, visit_date),
        notes = COALESCE($5, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;

    const values = [diagnosis, treatment, doctor_name, visit_date, notes, recordId];
    const result = await pool.query(updateQuery, values);

    res.json({
      success: true,
      message: 'Rekam medis berhasil diperbarui',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating medical record:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui rekam medis',
      error: error.message
    });
  }
});

router.post('/rekam-medis', async (req, res) => {
  const { patient_id, patient_name, date_of_birth, diagnosis, treatment, doctor_name, visit_date, notes } = req.body;

  if (!patient_id || !patient_name || !date_of_birth) {
    return res.status(400).json({
      success: false,
      message: 'patient_id, patient_name, dan date_of_birth wajib diisi'
    });
  }

  try {
    const insertQuery = `
      INSERT INTO medical_records (
        patient_id, patient_name, date_of_birth,
        diagnosis, treatment, doctor_name, visit_date, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      patient_id,
      patient_name,
      date_of_birth,
      diagnosis || 'Belum ada diagnosis',
      treatment || 'Belum ada treatment',
      doctor_name,
      visit_date,
      notes
    ];

    const result = await pool.query(insertQuery, values);

    res.status(201).json({
      success: true,
      message: 'Rekam medis berhasil dibuat',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating medical record:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat rekam medis',
      error: error.message
    });
  }
});

module.exports = router;
