const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../proto/medical_record.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const medicalRecordProto = grpc.loadPackageDefinition(packageDefinition).medicalrecord;

const SERVICE_B_HOST = process.env.SERVICE_B_HOST || 'localhost';
const SERVICE_B_GRPC_PORT = process.env.SERVICE_B_GRPC_PORT || 50051;

const client = new medicalRecordProto.MedicalRecordService(
  `${SERVICE_B_HOST}:${SERVICE_B_GRPC_PORT}`,
  grpc.credentials.createInsecure()
);

const checkMedicalRecord = (name, dateOfBirth) => {
  return new Promise((resolve, reject) => {
    client.CheckMedicalRecord(
      { name, date_of_birth: dateOfBirth },
      (error, response) => {
        if (error) {
          console.error('gRPC Error:', error);
          reject(error);
        } else {
          resolve(response);
        }
      }
    );
  });
};

module.exports = {
  checkMedicalRecord
};
