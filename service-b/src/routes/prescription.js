const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/prescriptions
 * Create new prescription (protected: doctor only)
 */
router.post('/prescriptions',
  authenticateToken,
  authorizeRoles('doctor', 'admin'),
  [
    body('medical_record_id').isInt(),
    body('patient_id').isInt(),
    body('medication_name').trim().notEmpty(),
    body('dosage').trim().notEmpty(),
    body('frequency').trim().notEmpty(),
    body('duration_days').isInt({ min: 1 }),
    body('quantity').isInt({ min: 1 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const {
        medical_record_id,
        patient_id,
        medication_name,
        dosage,
        frequency,
        duration_days,
        quantity,
        instructions
      } = req.body;

      // Calculate end date
      const result = await pool.query(
        `INSERT INTO prescriptions
         (medical_record_id, patient_id, prescribed_by, medication_name, dosage, frequency, duration_days, quantity, instructions, end_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE + INTERVAL '1 day' * $7)
         RETURNING *`,
        [medical_record_id, patient_id, req.user.full_name, medication_name, dosage, frequency, duration_days, quantity, instructions]
      );

      res.status(201).json({
        success: true,
        message: 'Prescription created successfully',
        data: {
          prescription: result.rows[0]
        }
      });
    } catch (error) {
      console.error('Create prescription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create prescription',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/prescriptions/patient/:patient_id
 * Get all prescriptions for a patient
 */
router.get('/prescriptions/patient/:patient_id',
  authenticateToken,
  async (req, res) => {
    try {
      const { patient_id } = req.params;

      // Check authorization - patient can only see own prescriptions
      if (req.user.role === 'patient' && req.user.patient_id != patient_id) {
        return res.status(403).json({
          success: false,
          message: 'Access forbidden'
        });
      }

      const result = await pool.query(
        `SELECT p.*, mr.visit_date, mr.doctor_name as attending_doctor
         FROM prescriptions p
         LEFT JOIN medical_records mr ON p.medical_record_id = mr.id
         WHERE p.patient_id = $1
         ORDER BY p.created_at DESC`,
        [patient_id]
      );

      res.json({
        success: true,
        data: {
          prescriptions: result.rows,
          count: result.rows.length
        }
      });
    } catch (error) {
      console.error('Get prescriptions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get prescriptions',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/prescriptions/:id
 * Get prescription by ID
 */
router.get('/prescriptions/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'SELECT * FROM prescriptions WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Prescription not found'
        });
      }

      res.json({
        success: true,
        data: {
          prescription: result.rows[0]
        }
      });
    } catch (error) {
      console.error('Get prescription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get prescription',
        error: error.message
      });
    }
  }
);

/**
 * PUT /api/prescriptions/:id
 * Update prescription status
 */
router.put('/prescriptions/:id',
  authenticateToken,
  authorizeRoles('doctor', 'admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, instructions } = req.body;

      const result = await pool.query(
        `UPDATE prescriptions
         SET status = COALESCE($1, status),
             instructions = COALESCE($2, instructions)
         WHERE id = $3
         RETURNING *`,
        [status, instructions, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Prescription not found'
        });
      }

      res.json({
        success: true,
        message: 'Prescription updated successfully',
        data: {
          prescription: result.rows[0]
        }
      });
    } catch (error) {
      console.error('Update prescription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update prescription',
        error: error.message
      });
    }
  }
);

module.exports = router;
