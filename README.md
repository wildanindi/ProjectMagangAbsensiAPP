# AbsensiKu - Attendance Management System

A complete attendance and leave management system for internship programs. Built with React (Frontend) and Node.js/Express (Backend).

## Features

### Employee/Interns
- **Dashboard**: View attendance summary and quick access to important features
- **Attendance History**: View detailed attendance records with status tracking
- **Leave Requests**: Submit leave/sick/special leave requests with date range
- **Profile Management**: Update personal information (name, email, phone)
- **Real-time Status**: Check today's attendance status and location

### Admin/Supervisor
- **Admin Dashboard**: Overview of employees, attendance, and leave approvals
- **Employee Management**: Add, edit, and manage employee/intern data
- **Leave Approvals**: Review and approve/reject leave requests
- **Attendance Monitoring**: Track daily attendance and identify issues
- **Employee Data Analytics**: View employee statistics and performance

## Project Structure

```
ProjectMagangAbsensiAPP/
├── backend/           # Node.js/Express backend
│   ├── config/       # Database configuration
│   ├── controllers/   # Business logic
│   ├── middleware/    # Auth & error handling
│   ├── models/       # Database queries
│   ├── routes/       # API endpoints
│   ├── sql/          # Database schema
│   └── server.js     # Entry point
└── frontend/         # React frontend
    ├── public/       # Static files
    └── src/
        ├── api/      # API client methods
        ├── components/  # React components
        ├── contexts/    # React contexts (Auth)
        ├── pages/       # Page components
        └── App.js    # Main app component
```

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MySQL database

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with database configuration:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=absensiku
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

4. Import database schema:
```bash
mysql -u root -p your_db_name < sql/query.sql
```

5. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user (Admin)
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Attendance (Absensi)
- `POST /api/absensi/check-in` - Check in (with photo)
- `GET /api/absensi/today/:userId` - Get today's attendance
- `GET /api/absensi/user/:userId` - Get attendance history
- `GET /api/absensi/summary/:userId` - Get attendance summary
- `GET /api/absensi/all` - Get all attendance (Admin)

### Leave (Izin)
- `POST /api/izin/request` - Create leave request
- `GET /api/izin/user/:userId` - Get user's leave requests
- `GET /api/izin/all` - Get all leave requests (Admin)
- `PUT /api/izin/:id/approve` - Approve leave request
- `PUT /api/izin/:id/reject` - Reject leave request

### Users
- `GET /api/users/all` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users` - Create new user (Admin)

## Default Credentials

For testing, you can use:
- **Username**: budi
- **Password**: 123456
- **Role**: USER (Employee)

For admin access:
- **Username**: admin
- **Password**: admin123
- **Role**: ADMIN

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Technologies Used

### Frontend
- React 19
- React Router DOM 7
- Axios (HTTP client)
- Lucide React (Icons)
- SweetAlert2 (Notifications)
- Day.js (Date handling)
- CSS3 (Styling)

### Backend
- Node.js
- Express.js
- MySQL2
- JWT (Authentication)
- Bcrypt (Password hashing)
- Multer (File uploads)
- Helmet (Security)
- CORS

## File Upload

The system supports photo uploads for attendance check-in using Multer. Ensure the `uploads/` directory exists in the backend.

## Security Features

- JWT token-based authentication
- Password hashing with Bcrypt
- CORS protection
- Helmet security headers
- Role-based access control
- Protected routes

## License

MIT License

## Support

For issues and questions, please contact the development team.

---

**Happy Attendance Tracking!** 🎉
