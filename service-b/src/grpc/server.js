const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { pool } = require('../config/database');

const PROTO_PATH = path.join(__dirname, '../../proto/medical_record.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const medicalRecordProto = grpc.loadPackageDefinition(packageDefinition).medicalrecord;

const checkMedicalRecord = async (call, callback) => {
  const { name, date_of_birth } = call.request;

  console.log(`gRPC Request - Checking medical record for: ${name}, DOB: ${date_of_birth}`);

  try {
    const query = `
      SELECT * FROM medical_records
      WHERE patient_name = $1 AND date_of_birth = $2
      ORDER BY visit_date DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [name, date_of_birth]);

    if (result.rows.length > 0) {
      const record = result.rows[0];
      const lastVisitDate = record.visit_date
        ? new Date(record.visit_date).toISOString().split('T')[0]
        : 'Tidak ada data';

      callback(null, {
        has_record: true,
        last_visit_date: lastVisitDate,
        message: 'Pasien memiliki rekam medis'
      });
    } else {
      callback(null, {
        has_record: false,
        last_visit_date: '',
        message: 'Pasien belum memiliki rekam medis'
      });
    }
  } catch (error) {
    console.error('Error checking medical record:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal server error'
    });
  }
};

const startGrpcServer = () => {
  const server = new grpc.Server();

  server.addService(medicalRecordProto.MedicalRecordService.service, {
    CheckMedicalRecord: checkMedicalRecord
  });

  const GRPC_PORT = process.env.GRPC_PORT || 50051;
  const bindAddress = `0.0.0.0:${GRPC_PORT}`;

  server.bindAsync(
    bindAddress,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('Failed to start gRPC server:', error);
        return;
      }
      console.log(`gRPC Server running on port ${port}`);
      server.start();
    }
  );

  return server;
};

module.exports = {
  startGrpcServer
};
