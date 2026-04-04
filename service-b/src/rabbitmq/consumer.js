const amqp = require('amqplib');
const { pool } = require('../config/database');

let channel = null;
let connection = null;

const RABBITMQ_HOST = process.env.RABBITMQ_HOST || 'localhost';
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || 5672;
const RABBITMQ_USER = process.env.RABBITMQ_USER || 'guest';
const RABBITMQ_PASS = process.env.RABBITMQ_PASS || 'guest';
const QUEUE_NAME = 'patient_registration';

const processPatientRegistration = async (patientData) => {
  try {
    const checkQuery = `
      SELECT * FROM medical_records
      WHERE patient_id = $1
    `;
    const checkResult = await pool.query(checkQuery, [patientData.id]);

    if (checkResult.rows.length > 0) {
      console.log(`Medical record already exists for patient ${patientData.id}`);
      return;
    }

    const insertQuery = `
      INSERT INTO medical_records (
        patient_id,
        patient_name,
        date_of_birth,
        diagnosis,
        treatment,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      patientData.id,
      patientData.name,
      patientData.date_of_birth,
      'Belum ada diagnosis',
      'Belum ada treatment',
      'Draf rekam medis otomatis dibuat saat pendaftaran'
    ];

    const result = await pool.query(insertQuery, values);
    console.log(`Created draft medical record for patient ${patientData.id}:`, result.rows[0]);
  } catch (error) {
    console.error('Error processing patient registration:', error);
    throw error;
  }
};

const startConsumer = async () => {
  try {
    const rabbitmqUrl = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`;
    connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    channel.prefetch(1);

    console.log('RabbitMQ Consumer connected, waiting for messages...');

    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        try {
          const patientData = JSON.parse(msg.content.toString());
          console.log('Received patient registration event:', patientData);

          await processPatientRegistration(patientData);

          channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          channel.nack(msg, false, false);
        }
      }
    });

    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
    });

    connection.on('close', () => {
      console.log('RabbitMQ connection closed. Reconnecting...');
      setTimeout(startConsumer, 5000);
    });

  } catch (error) {
    console.error('Failed to start RabbitMQ consumer:', error);
    setTimeout(startConsumer, 5000);
  }
};

const closeRabbitMQ = async () => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
  } catch (error) {
    console.error('Error closing RabbitMQ connection:', error);
  }
};

module.exports = {
  startConsumer,
  closeRabbitMQ
};
