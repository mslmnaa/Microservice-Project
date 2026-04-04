const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./config/database');
const { connectRabbitMQ } = require('./rabbitmq/publisher');
const patientRoutes = require('./routes/patient');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 8001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api', patientRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Service A - Pendaftaran Pasien',
    timestamp: new Date().toISOString()
  });
});

const startServer = async () => {
  try {
    await initDatabase();
    console.log('Database initialized');

    await connectRabbitMQ();
    console.log('RabbitMQ connected');

    app.listen(PORT, () => {
      console.log(`Service A running on port ${PORT}`);
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
