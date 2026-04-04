const amqp = require('amqplib');

let channel = null;
let connection = null;

const RABBITMQ_HOST = process.env.RABBITMQ_HOST || 'localhost';
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || 5672;
const RABBITMQ_USER = process.env.RABBITMQ_USER || 'guest';
const RABBITMQ_PASS = process.env.RABBITMQ_PASS || 'guest';

// Queue names
const QUEUE_PATIENT_REGISTRATION = 'patient_registration';
const QUEUE_APPOINTMENT_EVENTS = 'appointment_events';

const connectRabbitMQ = async () => {
  try {
    const rabbitmqUrl = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`;
    connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();

    // Assert multiple queues
    await channel.assertQueue(QUEUE_PATIENT_REGISTRATION, { durable: true });
    await channel.assertQueue(QUEUE_APPOINTMENT_EVENTS, { durable: true });

    console.log('RabbitMQ Publisher connected successfully');

    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
    });

    connection.on('close', () => {
      console.log('RabbitMQ connection closed. Reconnecting...');
      setTimeout(connectRabbitMQ, 5000);
    });

  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    setTimeout(connectRabbitMQ, 5000);
  }
};

const publishPatientRegistration = async (patientData) => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const message = JSON.stringify(patientData);
    channel.sendToQueue(QUEUE_PATIENT_REGISTRATION, Buffer.from(message), {
      persistent: true
    });

    console.log('Published patient registration event:', patientData.id);
  } catch (error) {
    console.error('Error publishing to RabbitMQ:', error);
    throw error;
  }
};

const publishAppointmentEvent = async (eventType, appointmentData) => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const message = JSON.stringify({
      eventType,
      data: appointmentData,
      timestamp: new Date().toISOString()
    });

    channel.sendToQueue(QUEUE_APPOINTMENT_EVENTS, Buffer.from(message), {
      persistent: true
    });

    console.log(`Published appointment event [${eventType}]:`, appointmentData.id);
  } catch (error) {
    console.error('Error publishing appointment event to RabbitMQ:', error);
    throw error;
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
  connectRabbitMQ,
  publishPatientRegistration,
  publishAppointmentEvent,
  closeRabbitMQ
};
