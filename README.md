# QueueLess - Token & Appointment Management System

A full-stack React Native application for managing token-based queues and appointments. Users can book tokens remotely and track their turn, while admins can manage services and call tokens efficiently.

## Features

### User Features
- User authentication (Login/Register)
- View available services
- Book tokens for services
- Track token status and estimated wait time
- View all booked tokens
- Cancel pending tokens
- Real-time token updates

### Admin Features
- Create and manage services
- View dashboard with service statistics
- Call next token
- Skip tokens
- Complete tokens
- Filter tokens by status

## Tech Stack

### Frontend
- React Native (Expo)
- React Navigation (Stack & Bottom Tabs)
- Context API for state management
- AsyncStorage for token persistence
- Axios for API calls

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- RESTful API design
- CORS enabled

## 📁 Project Structure

```
Project/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Service.js
│   │   └── Token.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── services.js
│   │   ├── tokens.js
│   │   └── admin.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── screens/
│   │   ├── auth/
│   │   ├── user/
│   │   └── admin/
│   ├── navigation/
│   ├── context/
│   ├── config/
│   ├── App.js
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Expo CLI
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `env.example`):
```bash
cp env.example .env
```
Then update the values in `.env` file.

4. Start the server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `config/api.js`:
   - Replace `192.168.1.1` with your local IP address
   - Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - For Android emulator use `10.0.2.2` instead of localhost

4. Start Expo:
```bash
npm start
```

5. Scan QR code with Expo Go app or press `a` for Android / `i` for iOS simulator

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Services
- `GET /api/services` - Get all active services
- `GET /api/services/:id` - Get service by ID

### Tokens
- `POST /api/tokens/book` - Book a new token
- `GET /api/tokens/my-tokens` - Get user's tokens
- `GET /api/tokens/my-tokens/:serviceId` - Get active token for service
- `DELETE /api/tokens/cancel/:tokenId` - Cancel a token

### Admin
- `POST /api/admin/services` - Create service
- `GET /api/admin/services` - Get all services
- `PUT /api/admin/services/:id` - Update service
- `GET /api/admin/tokens/:serviceId` - Get tokens for service
- `POST /api/admin/tokens/:tokenId/call` - Call a token
- `POST /api/admin/tokens/service/:serviceId/call-next` - Call next pending token
- `POST /api/admin/tokens/:tokenId/complete` - Complete a token
- `POST /api/admin/tokens/:tokenId/skip` - Skip a token
- `GET /api/admin/dashboard` - Get dashboard stats

## Database Models

### User
- name, email, password, role (user/admin)

### Service
- name, description, averageTimePerToken, isActive, createdBy

### Token
- tokenNumber, service, user, status, calledAt, completedAt, estimatedWaitTime

## Authentication

- JWT tokens stored in AsyncStorage
- Protected routes use Bearer token authentication
- Admin routes require admin role

## Key Features Implementation

### Token Generation
- Sequential token numbers per service
- Automatic calculation based on last token

### Wait Time Estimation
- Calculated based on pending tokens before current token
- Uses average time per token from service settings

### Real-time Updates
- Polling mechanism for token status updates
- Refresh controls on all list screens

## Screens

The app includes:
- Login/Register screens
- Services listing
- Token booking interface
- My Tokens with status tracking
- Admin dashboard
- Service management
- Token management interface

## Testing

### Initial Setup

1. **Seed the database** (creates admin and sample services):
```bash
cd backend
npm run seed
```
This creates:
- Admin user: `admin@queueless.com` / `admin123`
- 4 sample services

2. **Or register manually**:
   - Register with "Register as Admin" checkbox checked
   - Login as admin
   - Create services from Admin tab → Dashboard → Add Service

3. **Test as regular user**:
   - Register as regular user (uncheck admin checkbox)
   - View services and book tokens
   - Track your tokens in "My Tokens" tab

4. **Test as admin**:
   - Login as admin
   - Go to Admin tab
   - Click on a service to manage tokens
   - Use "Call Next Token" to call the next pending token
   - Call, Complete, or Skip tokens


## Notes

- **Admin Creation**: 
  - Use seed script: `npm run seed` (creates admin@queueless.com / admin123)
  - Or register with "Register as Admin" checkbox checked
- Token numbers are sequential per service
- Wait time updates automatically when tokens are called/completed
- "Call Next Token" automatically calls the lowest pending token number
- All timestamps are stored in UTC

