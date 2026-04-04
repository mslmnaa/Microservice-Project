const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { publishAppointmentEvent } = require('../rabbitmq/publisher');

const router = express.Router();

/**
 * POST /api/appointments
 * Create new appointment (protected: admin, doctor, nurse)
 */
router.post('/appointments',
  authenticateToken,
  authorizeRoles('admin', 'doctor', 'nurse'),
  [
    body('patient_id').isInt(),
    body('doctor_name').trim().notEmpty(),
    body('appointment_date').isDate(),
    body('appointment_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('duration_minutes').optional().isInt({ min: 15, max: 180 }),
    body('reason').optional().trim(),
    body('notes').optional().trim()
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
        patient_id,
        doctor_name,
        appointment_date,
        appointment_time,
        duration_minutes = 30,
        reason,
        notes
      } = req.body;

      // Check if patient exists
      const patientCheck = await pool.query(
        'SELECT id, name FROM patients WHERE id = $1',
        [patient_id]
      );

      if (patientCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      // Check for conflicting appointments
      const conflictCheck = await pool.query(
        `SELECT id FROM appointments
         WHERE doctor_name = $1
         AND appointment_date = $2
         AND appointment_time = $3
         AND status NOT IN ('cancelled')`,
        [doctor_name, appointment_date, appointment_time]
      );

      if (conflictCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Time slot already booked for this doctor'
        });
      }

      // Create appointment
      const result = await pool.query(
        `INSERT INTO appointments
         (patient_id, doctor_name, appointment_date, appointment_time, duration_minutes, reason, notes, created_by, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'scheduled')
         RETURNING *`,
        [patient_id, doctor_name, appointment_date, appointment_time, duration_minutes, reason, notes, req.user.id]
      );

      const appointment = result.rows[0];

      // Publish event to RabbitMQ
      try {
        await publishAppointmentEvent('appointment_scheduled', {
          ...appointment,
          patient_name: patientCheck.rows[0].name
        });
      } catch (error) {
        console.error('Failed to publish appointment event:', error);
      }

      res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        data: {
          appointment: {
            ...appointment,
            patient_name: patientCheck.rows[0].name
          }
        }
      });
    } catch (error) {
      console.error('Create appointment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create appointment',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/appointments
 * Get all appointments with filters (protected: admin, doctor, nurse)
 */
router.get('/appointments',
  authenticateToken,
  authorizeRoles('admin', 'doctor', 'nurse'),
  async (req, res) => {
    try {
      const { patient_id, doctor_name, status, date_from, date_to } = req.query;

      let query = `
        SELECT a.*, p.name as patient_name, p.phone, p.email
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      if (patient_id) {
        query += ` AND a.patient_id = $${paramCount}`;
        params.push(patient_id);
        paramCount++;
      }

      if (doctor_name) {
        query += ` AND a.doctor_name ILIKE $${paramCount}`;
        params.push(`%${doctor_name}%`);
        paramCount++;
      }

      if (status) {
        query += ` AND a.status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      if (date_from) {
        query += ` AND a.appointment_date >= $${paramCount}`;
        params.push(date_from);
        paramCount++;
      }

      if (date_to) {
        query += ` AND a.appointment_date <= $${paramCount}`;
        params.push(date_to);
        paramCount++;
      }

      query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

      const result = await pool.query(query, params);

      res.json({
        success: true,
        data: {
          appointments: result.rows,
          count: result.rows.length
        }
      });
    } catch (error) {
      console.error('Get appointments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get appointments',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/appointments/:id
 * Get appointment by ID
 */
router.get('/appointments/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT a.*, p.name as patient_name, p.phone, p.email, p.date_of_birth
         FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         WHERE a.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      res.json({
        success: true,
        data: {
          appointment: result.rows[0]
        }
      });
    } catch (error) {
      console.error('Get appointment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get appointment',
        error: error.message
      });
    }
  }
);

/**
 * PUT /api/appointments/:id
 * Update appointment
 */
router.put('/appointments/:id',
  authenticateToken,
  authorizeRoles('admin', 'doctor', 'nurse'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes, appointment_date, appointment_time } = req.body;

      const result = await pool.query(
        `UPDATE appointments
         SET status = COALESCE($1, status),
             notes = COALESCE($2, notes),
             appointment_date = COALESCE($3, appointment_date),
             appointment_time = COALESCE($4, appointment_time),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [status, notes, appointment_date, appointment_time, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      // Publish update event
      try {
        await publishAppointmentEvent('appointment_updated', result.rows[0]);
      } catch (error) {
        console.error('Failed to publish appointment update event:', error);
      }

      res.json({
        success: true,
        message: 'Appointment updated successfully',
        data: {
          appointment: result.rows[0]
        }
      });
    } catch (error) {
      console.error('Update appointment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update appointment',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/doctors
 * Get all active doctors
 */
router.get('/doctors', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM doctors WHERE is_active = true ORDER BY name'
    );

    res.json({
      success: true,
      data: {
        doctors: result.rows,
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctors',
      error: error.message
    });
  }
});

/**
 * POST /api/doctors
 * Create new doctor (protected: admin only)
 */
router.post('/doctors',
  authenticateToken,
  authorizeRoles('admin'),
  [
    body('name').trim().notEmpty(),
    body('specialization').trim().notEmpty(),
    body('email').optional().isEmail(),
    body('phone').optional().trim()
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

      const { name, specialization, email, phone, available_days, start_time, end_time } = req.body;

      const result = await pool.query(
        `INSERT INTO doctors (name, specialization, email, phone, available_days, start_time, end_time)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [name, specialization, email, phone, available_days || null, start_time || '08:00:00', end_time || '17:00:00']
      );

      res.status(201).json({
        success: true,
        message: 'Doctor created successfully',
        data: {
          doctor: result.rows[0]
        }
      });
    } catch (error) {
      console.error('Create doctor error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create doctor',
        error: error.message
      });
    }
  }
);

module.exports = router;
