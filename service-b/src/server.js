const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./config/database');
const { startGrpcServer } = require('./grpc/server');
const { startConsumer } = require('./rabbitmq/consumer');
const medicalRecordRoutes = require('./routes/medical_record');
const authRoutes = require('./routes/auth');
const prescriptionRoutes = require('./routes/prescription');

const app = express();
const PORT = process.env.PORT || 8002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api', prescriptionRoutes);
app.use('/api', medicalRecordRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Service B - Rekam Medis',
    timestamp: new Date().toISOString()
  });
});

const startServer = async () => {
  try {
    await initDatabase();
    console.log('Database initialized');

    startGrpcServer();
    console.log('gRPC Server started');

    await startConsumer();
    console.log('RabbitMQ Consumer started');

    app.listen(PORT, () => {
      console.log(`Service B HTTP API running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});

startServer();
