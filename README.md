# 🏥 Hospital Microservices Management System

Modern hospital management system built with microservices architecture, featuring JWT authentication, appointment scheduling, and prescription management.

## 🎯 Enhanced Features

### **NEW: Modern React Frontend**
- React + Vite + Tailwind CSS
- JWT-based authentication with role-based access
- Professional hospital dashboard
- Real-time data updates
- Responsive design

### **NEW: JWT Authentication & Authorization**
- Secure login/register system
- Role-based access control (Admin, Doctor, Nurse, Patient)
- Protected API endpoints
- Token-based authentication

### **NEW: Appointment Scheduling System**
- Book doctor appointments
- Doctor availability management
- Appointment status tracking (scheduled, confirmed, completed, cancelled)
- Conflict detection for double-booking prevention

### **NEW: Prescription Management**
- Create prescriptions linked to medical records
- Track medication dosage and frequency
- Prescription status monitoring
- Patient prescription history

## 📐 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                  │
│                         Port 3000                            │
│          JWT Auth │ Dashboard │ Appointments │ Patients     │
└────────────────────────┬─────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌──────────────────┐            ┌──────────────────┐
│    Service A     │            │    Service B     │
│  Pendaftaran +   │   gRPC     │  Rekam Medis +   │
│   Appointments   │───────────▶│  Prescriptions   │
│   (Port 8001)    │            │   (Port 8002)    │
│                  │  RabbitMQ  │                  │
│                  │───────────▶│                  │
└────────┬─────────┘            └────────┬─────────┘
         │                               │
         ▼                               ▼
    ┌─────────┐                    ┌─────────┐
    │  DB-A   │                    │  DB-B   │
    │(Pg:5433)│                    │(Pg:5434)│
    └─────────┘                    └─────────┘
         ▲                               ▲
         └───────────────┬───────────────┘
                         │
                    ┌─────────┐
                    │RabbitMQ │
                    │(5672)   │
                    └─────────┘
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS 3
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Server**: Nginx (production)

### Backend
- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Authentication**: JWT (jsonwebtoken + bcryptjs)
- **Validation**: express-validator
- **Database**: PostgreSQL 15 (isolated per service)

### Communication
- **Synchronous**: gRPC (@grpc/grpc-js)
- **Asynchronous**: RabbitMQ (amqplib)

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Databases**: 2x PostgreSQL (db_pendaftaran, db_rekam_medis)
- **Message Queue**: RabbitMQ with Management UI

## 📊 Database Schema

### Service A - db_pendaftaran

**users** (JWT Authentication)
```sql
id, email, password_hash, full_name, role, patient_id, phone, created_at, last_login
```

**patients** (Extended)
```sql
id, name, date_of_birth, address, phone, email, registration_date,
has_medical_record, last_visit_date, user_id, category, emergency_contact, blood_type
```

**doctors** (NEW)
```sql
id, name, specialization, email, phone, available_days[], start_time, end_time,
is_active, created_at
```

**appointments** (NEW)
```sql
id, patient_id, doctor_name, appointment_date, appointment_time, duration_minutes,
status, reason, notes, created_by, created_at, updated_at
```

### Service B - db_rekam_medis

**users** (Shared Auth Schema)
```sql
id, email, password_hash, full_name, role, patient_id, phone, created_at, last_login
```

**medical_records** (Extended)
```sql
id, patient_id, patient_name, date_of_birth, diagnosis, treatment, doctor_name,
visit_date, notes, created_at, updated_at, appointment_id, status, follow_up_date,
chief_complaint
```

**prescriptions** (NEW)
```sql
id, medical_record_id, patient_id, prescribed_by, medication_name, dosage,
frequency, duration_days, quantity, instructions, start_date, end_date, status,
created_at
```

**vital_signs** (NEW)
```sql
id, medical_record_id, patient_id, recorded_at, blood_pressure_systolic,
blood_pressure_diastolic, heart_rate, temperature, respiratory_rate,
oxygen_saturation, weight, height, bmi, notes, recorded_by
```

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed
- Ports available: 3000, 5672, 5433, 5434, 8001, 8002, 15672, 50051

### Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd hospital-microservices
```

2. **Start all services**
```bash
docker-compose up --build
```

3. **Wait for services to be ready** (~60 seconds)

4. **Seed demo data** (Optional but recommended)
```bash
# Connect to Service A database
docker exec -i hospital-db-a psql -U postgres -d db_pendaftaran < scripts/seed-data.sql
```

5. **Access the application**
- **Frontend (React)**: http://localhost:3000
- **Service A API**: http://localhost:8001
- **Service B API**: http://localhost:8002
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

### Demo Login Credentials

After seeding data, use these credentials:

| Role    | Email                    | Password   |
|---------|--------------------------|------------|
| Admin   | admin@hospital.com       | admin123   |
| Doctor  | doctor@hospital.com      | doctor123  |
| Nurse   | nurse@hospital.com       | nurse123   |

## 📡 API Endpoints

### Authentication (Both Services)

**POST** `/api/auth/register`
```json
{
  "email": "user@hospital.com",
  "password": "password123",
  "full_name": "John Doe",
  "role": "doctor",
  "phone": "081234567890"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "doctor@hospital.com",
  "password": "doctor123"
}
```

**GET** `/api/auth/me` - Get current user (requires JWT token)

### Service A - Patients & Appointments

**POST** `/api/daftar` - Register new patient
```json
{
  "name": "John Doe",
  "date_of_birth": "1990-01-15",
  "phone": "081234567890",
  "email": "john@example.com",
  "address": "Jakarta",
  "category": "umum",
  "blood_type": "A+"
}
```

**GET** `/api/pasien` - List all patients

**GET** `/api/pasien/:id` - Get patient details

**POST** `/api/appointments` - Schedule appointment (Protected: admin, doctor, nurse)
```json
{
  "patient_id": 1,
  "doctor_name": "Dr. Sarah Williams",
  "appointment_date": "2024-04-15",
  "appointment_time": "10:00",
  "duration_minutes": 30,
  "reason": "Check-up",
  "notes": "Follow-up visit"
}
```

**GET** `/api/appointments` - List appointments with filters
- Query params: `?patient_id=1&doctor_name=Sarah&status=scheduled&date_from=2024-04-01&date_to=2024-04-30`

**GET** `/api/appointments/:id` - Get appointment details

**PUT** `/api/appointments/:id` - Update appointment status/notes

**GET** `/api/doctors` - List active doctors

**POST** `/api/doctors` - Create doctor (Protected: admin only)

### Service B - Medical Records & Prescriptions

**GET** `/api/rekam-medis/:patient_id` - Get medical records by patient ID

**PUT** `/api/rekam-medis/:patient_id` - Update medical record

**POST** `/api/rekam-medis` - Create medical record

**POST** `/api/prescriptions` - Create prescription (Protected: doctor, admin)
```json
{
  "medical_record_id": 1,
  "patient_id": 1,
  "medication_name": "Paracetamol",
  "dosage": "500mg",
  "frequency": "3x sehari",
  "duration_days": 7,
  "quantity": 21,
  "instructions": "Setelah makan"
}
```

**GET** `/api/prescriptions/patient/:patient_id` - Get patient prescriptions

**GET** `/api/prescriptions/:id` - Get prescription details

**PUT** `/api/prescriptions/:id` - Update prescription status

## 🔐 Security Features

- **Password Hashing**: Bcrypt with 10 salt rounds
- **JWT Tokens**: 24-hour expiry, secure secret key
- **Role-Based Access Control**: Admin, Doctor, Nurse, Patient roles
- **Protected Routes**: Middleware validation for all sensitive endpoints
- **Input Validation**: express-validator for all user inputs
- **CORS Enabled**: Cross-origin resource sharing configured
- **Database Isolation**: Each service has its own PostgreSQL database

## 🎨 Frontend Features

### Pages
1. **Login** - JWT authentication with modern UI
2. **Dashboard** - Overview statistics and quick actions
3. **Patients** - List, search, and register patients
4. **Appointments** - Schedule and manage doctor appointments
5. **Medical Records** - View and update patient medical history (placeholder)
6. **Prescriptions** - Manage medications and prescriptions (placeholder)

### Components
- **Sidebar Navigation** - Role-based menu items
- **Protected Routes** - Automatic redirect to login if unauthorized
- **Real-time Updates** - Automatic data refresh after actions
- **Form Validation** - Client-side validation with error messages
- **Loading States** - Skeleton loaders and spinners
- **Responsive Design** - Works on desktop, tablet, and mobile

## 🔄 Communication Patterns

### gRPC (Synchronous)
- **Use Case**: Real-time medical record validation
- **Flow**: Service A → gRPC Call → Service B
- **Example**: Check if patient has existing medical records during registration

### RabbitMQ (Asynchronous)
- **Use Case**: Event-driven medical record creation
- **Queues**:
  - `patient_registration` - New patient registered
  - `appointment_events` - Appointment scheduled/updated/cancelled
- **Flow**: Service A publishes → RabbitMQ → Service B consumes → Auto-create draft records

## 🧪 Testing Flow

1. **Login** as admin (`admin@hospital.com` / `admin123`)

2. **Register Patient**:
   - Go to Patients page
   - Click "Register New Patient"
   - Fill form and submit
   - ✅ Patient saved to DB-A
   - ✅ gRPC checks Service B for existing records
   - ✅ RabbitMQ event published
   - ✅ Service B creates draft medical record

3. **Schedule Appointment**:
   - Go to Appointments page
   - Click "Schedule Appointment"
   - Select patient and doctor
   - Choose date/time
   - ✅ Appointment saved to DB-A
   - ✅ RabbitMQ event published
   - ✅ Service B updates medical record with appointment info

4. **View Dashboard**:
   - See patient and appointment statistics
   - Access quick actions
   - Navigate to different sections based on role

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker logs hospital-service-a
docker logs hospital-service-b
docker logs hospital-frontend

# Stop services
docker-compose down

# Stop and remove volumes (⚠️ deletes all data)
docker-compose down -v

# Restart specific service
docker-compose restart service-a

# Execute SQL in database
docker exec -it hospital-db-a psql -U postgres -d db_pendaftaran
```

## 🛠️ Development

### Local Development (without Docker)

**Backend Services:**
```bash
# Service A
cd service-a
npm install
npm run dev

# Service B
cd service-b
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

**Required Environment:**
- PostgreSQL running on ports 5433 and 5434
- RabbitMQ running on port 5672
- Update `.env` files with local connection strings

## 📝 Environment Variables

### Service A & B
```env
PORT=8001  # 8002 for Service B
DB_HOST=localhost
DB_PORT=5433  # 5434 for Service B
DB_NAME=db_pendaftaran  # db_rekam_medis for Service B
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=24h
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
SERVICE_B_HOST=localhost  # Service A only
SERVICE_B_GRPC_PORT=50051  # Service A only
GRPC_PORT=50051  # Service B only
```

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 <PID>
```

### Database Connection Errors
- Wait for health checks to complete (~30 seconds)
- Check `docker logs hospital-db-a`
- Ensure ports 5433 and 5434 are available

### Frontend Can't Connect to Backend
- Verify Service A is running on port 8001
- Check nginx proxy configuration
- Ensure CORS is enabled in backend

### RabbitMQ Consumer Not Processing Events
```bash
# Check RabbitMQ management UI
open http://localhost:15672

# View Service B logs
docker logs -f hospital-service-b
```

### JWT Token Expired
- Login again to get new token
- Tokens expire after 24 hours
- Check localStorage in browser DevTools

## 📚 Project Structure

```
hospital-microservices/
├── service-a/                 # Service Pendaftaran + Appointments
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT middleware
│   │   ├── routes/
│   │   │   ├── auth.js        # Login/register
│   │   │   ├── patient.js     # Patient CRUD
│   │   │   └── appointment.js # Appointments
│   │   ├── utils/
│   │   │   └── jwt.js         # JWT utilities
│   │   ├── grpc/
│   │   │   └── client.js
│   │   ├── rabbitmq/
│   │   │   └── publisher.js
│   │   └── server.js
│   ├── proto/
│   │   └── medical_record.proto
│   ├── package.json
│   └── Dockerfile
├── service-b/                 # Service Rekam Medis + Prescriptions
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── medical_record.js
│   │   │   └── prescription.js # NEW
│   │   ├── utils/
│   │   │   └── jwt.js
│   │   ├── grpc/
│   │   │   └── server.js
│   │   ├── rabbitmq/
│   │   │   └── consumer.js
│   │   └── server.js
│   ├── proto/
│   │   └── medical_record.proto
│   ├── package.json
│   └── Dockerfile
├── frontend/                  # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   └── layout/
│   │   │       ├── Sidebar.jsx
│   │   │       └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Patients.jsx
│   │   │   └── Appointments.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── patientService.js
│   │   │   └── appointmentService.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── scripts/
│   └── seed-data.sql          # Demo users and doctors
├── docker-compose.yml
└── README.md
```

## 🎓 Educational Notes

### Microservices Principles Demonstrated
✅ **Service Isolation**: Each service has its own database
✅ **Communication Patterns**: Both sync (gRPC) and async (RabbitMQ)
✅ **Contract-First Development**: Protocol Buffers define gRPC contracts
✅ **Event-Driven Architecture**: RabbitMQ for loosely coupled services
✅ **API Gateway Pattern**: Nginx as reverse proxy
✅ **Health Checks**: Database and RabbitMQ health monitoring
✅ **Security**: JWT authentication across services

### Technologies Learned
- React modern practices (Hooks, Context API, Router)
- Tailwind CSS utility-first styling
- JWT authentication flow
- gRPC bidirectional communication
- RabbitMQ message queuing
- Docker multi-stage builds
- Nginx reverse proxy configuration
- PostgreSQL database design
- RESTful API design

## 📄 License

This project was created for educational purposes (Jaringan Komputer Terapan course).

## 👥 Contributors

- **Developer**: [Your Name]
- **Student ID**: [Your NIM]
- **Course**: Jaringan Komputer Terapan
- **Institution**: [Your University]

---

Made with ❤️ for learning microservices architecture
